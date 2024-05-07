import axios from "axios";
import {Readable} from "stream";
import {OAuthService, Organisation, RateLimiterService} from "@ocular/ocular";
import {AppNameDefinitions, DocType, IndexableDocument, Logger, Section, TransactionBaseService,} from "@ocular/types";
import {ConfigModule} from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible"

interface Config {
  headers: {
    Authorization: string;
    Accept: string;
  };
}

export default class BitBucketService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(AppNameDefinitions.BITBUCKET);
  }

  async getBitBucketData(org: Organisation) {
    return Readable.from(this.getBitBucketInformation(org));
  }

  async *getBitBucketInformation(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(`Starting oculation of BitBucket for ${org.id} organisation`);

    // Get BitBucket OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.BITBUCKET,
    });

    if (!oauth) {
      this.logger_.error(`No Bitbucket OAuth found for ${org.id} organisation`);
      return;
    }

    const config: Config = {
      headers: {
        Authorization: `Bearer ${oauth.token}`,
        Accept: "application/json",
      },
    };

    let documents: IndexableDocument[] = [];

    try {
      const workspaces = await this.fetchWorkspaces(config)
      for (const workspace of workspaces) {
        const repositories = await this.fetchRepositoriesForWorkspace(workspace.slug,config);
        for(const repository of repositories){
          const prs = await this.fetchPRForRepositories(workspace.slug,repository.uuid,config)
          for( const pr of prs){
            // add comment section reference in section tag
            const comments = await this.fetchCommentsForPR(workspace.slug,repository.uuid,pr.id,config)
            const sections: Section[] = comments.map((comment,index)=>({
              offset: index,
              content: comment.type,
              link: `https://api.bitbucket.org/2.0/repositories/${workspace.slug}/${repository.uuid}/pullrequests/${pr.id}/comments`
            }))
            const prDoc: IndexableDocument = {
              id:pr.id,
              organisationId:org.id,
              source: AppNameDefinitions.BITBUCKET,
              title:pr.title,
              metadata:{
                repository_id: repository.uuid,
                workspace_id: workspace.uuid,
              },
              sections:sections,
              type: DocType.TEXT,
              updatedAt: new Date(Date.now())
            }
            documents.push(prDoc);
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
          }

          const issues = await this.fetchIssueForRepositories(workspace.slug,repository.uuid,config);
          for( const issue of issues){
            // add comment section reference in section tag
            const comments = await this.fetchCommentsForIssue(workspace.slug,repository.uuid,issue.id,config)
            const sections: Section[] = comments.map((comment,index)=>({
              offset: index,
              content: comment.type,
              link: `https://api.bitbucket.org/2.0/repositories/${workspace.slug}/${repository.uuid}/issues/${issue.id}/comments`
            }))
            const issueDoc: IndexableDocument = {
              id:issue.id,
              organisationId:org.id,
              source: AppNameDefinitions.BITBUCKET,
              title:issue.title,
              metadata:{
                repository_id: repository.uuid,
                workspace_id: workspace.uuid,
              },
              sections:sections,
              type: DocType.TEXT,
              updatedAt: new Date(Date.now())
            }
            documents.push(issueDoc);
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
          }
        }
      }
      yield documents;
      await this.oauthService_.update(oauth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(`Refreshing bitbucket token for ${org.id} organisation`);

        // Refresh the token
        const oauthToken = await this.container_["bitbucketOauth"].refreshToken(
          oauth.refresh_token
        );

        // Update the OAuth record with the new token
        await this.oauthService_.update(oauth.id, oauthToken);

        // Retry the request
        return this.getBitBucketInformation(org);
      } else {
        throw new Error(error)
      }
    }

    this.logger_.info(`Finished oculation of BitBucket for ${org.id} organisation`);
  }

  async fetchWorkspaces(config:Config){
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
    try{
      const workspaceEndpoint = await axios.get("https://api.bitbucket.org/2.0/workspaces",config)
      const workspaceArray = workspaceEndpoint.data.values || []
      return workspaceArray
    }catch(error){
      throw new Error("Failed to fetch workspaces")
    }
  }

  async fetchRepositoriesForWorkspace(workspace_slug:string, config:Config) {
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
    try {
      const repoEndpoint = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace_slug}`, config)
      const repoArray = repoEndpoint.data.values || []
      return repoArray
    } catch (err) {
      throw new Error("Repositoes not able to fetch")
    }
  }

  async fetchPRForRepositories(workspace_slug:string,repo_slug:string,config:Config){
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
      try{
        const prEndpoint = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/pullrequests`,config)
        const prArray = prEndpoint.data.values || []
        return prArray
      }catch(err){
        throw new Error("Failed to fetch pull requests");
      }
  }
  async fetchIssueForRepositories(workspace_slug:string,repo_slug:string,config:Config){
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
    try{
      const issueEndpoint = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/issues`,config)
      const issueArray = issueEndpoint.data.values || []
      return issueArray
    }catch(err){
      throw new Error("Failed to fetch issues");
    }
  }

  async fetchCommentsForIssue(workspace_slug:string,repo_slug:string,issue_id:string,config:Config){
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
    try{
      const commentsEndpoint = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/issues/${issue_id}/comments`,config)
      const commentsArray = commentsEndpoint.data.values || []
      return commentsArray
    }catch(err){
      throw new Error("Failed to fetch comments");
    }
  }

  async fetchCommentsForPR(workspace_slug:string,repo_slug:string,pr_id:string,config:Config){
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.BITBUCKET)
    try{
      const commentsEndpoint = await axios.get(`https://api.bitbucket.org/2.0/repositories/${workspace_slug}/${repo_slug}/pullrequests/${pr_id}/comments`,config)
      const commentsArray = commentsEndpoint.data.values || []
      return commentsArray
    }catch(err){
      throw new Error("Failed to fetch comments");
    }
  }
}
