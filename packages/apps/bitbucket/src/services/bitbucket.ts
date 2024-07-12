import axios from "axios";
import { Readable } from "stream";
import {
  AppAuthorizationService,
  Organisation,
  RateLimiterService,
} from "@ocular/ocular";
import {
  AppNameDefinitions,
  DocType,
  IndexableDocument,
  Logger,
  Section,
  TransactionBaseService,
  ApiConfig,
  AuthStrategy,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible";

export default class BitBucketService extends TransactionBaseService {
  protected appAuthorizationService_: AppAuthorizationService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;

  constructor(container) {
    super(arguments[0]);
    this.appAuthorizationService_ = container.appAuthorizationService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.BITBUCKET
    );
  }

  async getBitBucketData(org: Organisation) {
    return Readable.from(this.getBitBucketInformation(org));
  }

  async *getBitBucketInformation(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(
      `Starting oculation of BitBucket for ${org.id} organisation`
    );

    // Get BitBucket AuthToken for the organisation
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.BITBUCKET,
    });

    if (!auth) {
      this.logger_.error(`No Bitbucket Auth found for ${org.id} organisation`);
      return;
    }

    const config: ApiConfig = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: "application/json",
      },
    };

    let documents: IndexableDocument[] = [];

    try {
      let workspaces = []
      if(auth.auth_strategy === AuthStrategy.API_TOKEN_STRATEGY){
        if(!auth?.metadata?.workspace){
          throw new Error("No workspace found in metadata")
        }
        const workspace = await this.fetchWorkspace(auth?.metadata?.workspace as string, config)
        workspaces = [workspace]
      }
      else{
        workspaces = await this.fetchWorkspaces(config);
      }      
      for (const workspace of workspaces) {
        const repositories = await this.fetchRepositoriesForWorkspace(
          workspace.slug,
          config
        );
        for (const repository of repositories) {
          const prs = await this.fetchPRForRepositories(
            workspace.slug,
            repository.uuid,
            config
          );
          for (const pr of prs) {
            // add comment section reference in section tag
            const comments = await this.fetchCommentsForPR(
              workspace.slug,
              repository.uuid,
              pr.id,
              config
            );
            const sections: Section[] = comments.map((comment, index) => ({
              offset: index,
              content: comment.content.raw,
              link: `https://api.bitbucket.org/2.0/repositories/${workspace.slug}/${repository.uuid}/pullrequests/${pr.id}/comments`,
              metadata: {
                user: comment.user?.display_name,
                user_type: comment.user?.type,
                deleted: comment.deleted,
                pending: comment.pending,
                type: comment.type,
              }
            }));
            const prDoc: IndexableDocument = {
              id: pr.id,
              organisationId: org.id,
              source: AppNameDefinitions.BITBUCKET,
              title: pr.title,
              metadata: {
                repository_id: repository.uuid,
                workspace_id: workspace.uuid,
                description: pr.description,
                state: pr.state,
                closed_by: pr.closed_by,
                created_on: pr.created_on,
                updated_on: pr.updated_on,
                author_name: pr.author?.display_name,
                author_type: pr.author?.type
              },
              sections: sections,
              type: DocType.TXT,
              updatedAt: new Date(Date.now()),
            };
            documents.push(prDoc);
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
          }

          const issues = await this.fetchIssueForRepositories(
            workspace.slug,
            repository.uuid,
            config
          );
          for (const issue of issues) {
            // add comment section reference in section tag
            const comments = await this.fetchCommentsForIssue(
              workspace.slug,
              repository.uuid,
              issue.id,
              config
            );
            
            // need to add metadata
            const sections: Section[] = comments.map((comment, index) => ({
              offset: index,
              content: comment.type,
              link: `https://api.bitbucket.org/2.0/repositories/${workspace.slug}/${repository.uuid}/issues/${issue.id}/comments`,
            }));
            const issueDoc: IndexableDocument = {
              id: issue.id,
              organisationId: org.id,
              source: AppNameDefinitions.BITBUCKET,
              title: issue.title,
              metadata: {
                repository_id: repository.uuid,
                workspace_id: workspace.uuid,
                title: issue.title,
                reporter_type: issue.reporter?.type,
                assignee_type: issue.assignee?.type,
                created_on: issue.created_on,
                updated_on: issue.updated_on,
                edited_on: issue.edited_on,
                kind: issue.kind,
                priority: issue.priority,
                content: issue.content?.raw
              },
              sections: sections,
              type: DocType.TXT,
              updatedAt: new Date(Date.now()),
            };
            documents.push(issueDoc);
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
          }
        }
      }
      yield documents;
      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(
          `Refreshing bitbucket token for ${org.id} organisation`
        );

        // Refresh the token
        const authToken = await this.container_["bitbucketOauth"].refreshToken(
          auth.refresh_token
        );

        // Update the Auth record with the new token
        await this.appAuthorizationService_.update(auth.id, authToken);

        // Retry the request
        return this.getBitBucketInformation(org);
      } else {
        this.logger_.error(error)
        throw new Error(error);
      }
    }

    this.logger_.info(
      `Finished oculation of BitBucket for ${org.id} organisation`
    );
  }

  async fetchWorkspace(workspaceName: string, config: ApiConfig){
    try{
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
      const url = `https://api.bitbucket.org/2.0/workspaces/${workspaceName}`
      const workspace = await axios.get(url, config)
      if(workspace.status !== 200) throw new Error(`Failed to fetch workspace ${workspaceName}`);
      return workspace.data
    }
    catch(error){
      this.logger_.error(`Failed to fetch workspace ${workspaceName}`)
      throw new Error(`Failed to fetch workspace ${workspaceName}`);
    }
  }

  async fetchWorkspaces(config: ApiConfig) {
    // Block Until Rate Limit Allows Request
    try {
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
      const workspaceEndpoint = await axios.get(
        "https://api.bitbucket.org/2.0/workspaces",
        config
      );
      const workspaceArray = workspaceEndpoint.data.values || [];
      return workspaceArray;
    } catch (error) {
      this.logger_.error("Failed to fetch workspaces")
      throw new Error("Failed to fetch workspaces");
    }
  }

  async fetchRepositoriesForWorkspace(
    workspace_slug: string,
    config: ApiConfig
  ) {
    try {
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
      const repoEndpoint = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${workspace_slug}`,
        config
      );
      const repoArray = repoEndpoint.data.values || [];
      return repoArray;
    } catch (err) {
      this.logger_.error("Repositoes not able to fetch")
      throw new Error("Repositoes not able to fetch");
    }
  }

  async fetchPRForRepositories(
    workspace_slug: string,
    repo_slug: string,
    config: ApiConfig
  ) {
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
    try {
      const prEndpoint = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/pullrequests`,
        config
      );
      const prArray = prEndpoint.data.values || [];
      return prArray;
    } catch (err) {
      this.logger_.error(err)
      return []
    }
  }
  async fetchIssueForRepositories(
    workspace_slug: string,
    repo_slug: string,
    config: ApiConfig
  ) {
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
    try {
      const issueEndpoint = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/issues`,
        config
      );
      const issueArray = issueEndpoint.data.values || [];
      return issueArray;
    } catch (err) {
      this.logger_.error(err)
      return []
    }
  }

  async fetchCommentsForIssue(
    workspace_slug: string,
    repo_slug: string,
    issue_id: string,
    config: ApiConfig
  ) {
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
    try {
      const commentsEndpoint = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/issues/${issue_id}/comments`,
        config
      );
      const commentsArray = commentsEndpoint.data.values || [];
      return commentsArray;
    } catch (err) {
      this.logger_.error(err)
      return []
    }
  }

  async fetchCommentsForPR(
    workspace_slug: string,
    repo_slug: string,
    pr_id: string,
    config: ApiConfig
  ) {
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.BITBUCKET);
    try {
      const commentsEndpoint = await axios.get(
        `https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/pullrequests/${pr_id}/comments`,
        config
      );
      const commentsArray = commentsEndpoint.data.values || [];
      return commentsArray;
    } catch (err) {
      this.logger_.error(err)
      return []
    }
  }
}
