

import { EntityManager } from "typeorm"
import { Octokit } from "@octokit/rest"
import {  AppNameDefinitions , IEventBusService } from "@ocular-ai/types"
import { App, OrganisationService } from "@ocular/ocular"
import  GitHubService  from "../services/github"

type InjectedDependencies = {
  eventBusService: IEventBusService
  organisationService: OrganisationService
  githubService: GitHubService
  manager: EntityManager
}

class GitHubOauthSubscriber {
  protected readonly manager_: EntityManager
  protected readonly eventBus_: IEventBusService
  protected readonly organisationService_: OrganisationService
  protected readonly githubService_: GitHubService

  constructor({ manager, githubService, organisationService, eventBusService }: InjectedDependencies) {
    this.eventBus_ = eventBusService
    this.organisationService_ = organisationService
    this.githubService_ = githubService
    this.manager_ = manager

    this.eventBus_.subscribe(
      "oauth.token_generated.github",
      async (data) => {
        console.log("TOKEN RECEIVED IN SUB", data)
        await this.getInstallationIds(data)
      }
    )
  }


  async getInstallationIds(data: any) {
    await this.manager_.transaction(
      "SERIALIZABLE",
      async (transactionManager) => {

        const octokit = new Octokit({
          auth: data.token.token,
        })
        
        const installationsData = await octokit.request('GET /user/installations', {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })
        
        
        const installations = installationsData.data.installations.map(installation => ({
          name: AppNameDefinitions.GITHUB,
          installation_id: installation.id.toString(),
          permissions: installation.permissions
        }))

        await this.organisationService_.update(data.organisation.id,{installed_apps:installations});
      }
    )
  }
}

export default GitHubOauthSubscriber