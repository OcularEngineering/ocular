import {AbstractBatchJobStrategy} from "@ocular-ai/core-backend"
import {BatchJobService} from "@ocular-ai/core-backend"
import { EntityManager } from "typeorm"

class GithubIndexingStrategy extends AbstractBatchJobStrategy {
  static identifier = "github-indexing-strategy"
  static batchType = "index-github-repositories"
  protected batchJobService_: BatchJobService

  async processJob(batchJobId: string): Promise<void> {
    return await this.atomicPhase_(
      async (transactionManager) => {
    
        // MVP -> Index All MVP Repositories Here
        // TODO: Push Repositories into a PUB/SUB And Allow Multiple Workers (Catalog|SearchIndexer) To Consume This Information.


        // Get Github Repositories for The Organisation
        // const githubRepos = await this.githubService_.getGitHubRepositories(org)

      // Index The Repositories in the Search 
      

  
        // await this.batchJobService_
        //   .withTransaction(transactionManager)
        //   .update(batchJobId, {
        //     result: {
        //       advancement_count: productList.length,
        //     },
        //   })
      }
    )
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.")
  }

  protected manager_: EntityManager
  protected transactionManager_: EntityManager

}

export default GithubIndexingStrategy