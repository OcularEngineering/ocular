
import { TransactionBaseService } from "./transaction-base-service"
import { CreateBatchJobInput } from "../batch-job"


export interface IBatchJobStrategy extends TransactionBaseService {
  /**
   * Method for preparing a batch job for processing
   */
  prepareBatchJobForProcessing(
    batchJobEntity: CreateBatchJobInput,
    req: Express.Request
  ): Promise<CreateBatchJobInput>

  /**
   * Method for pre-processing a batch job
   */
  preProcessBatchJob(batchJobId: string): Promise<void>

  /**
   *  Method does the actual processing of the job. Should report back on the progress of the operation.
   */
  processJob(batchJobId: string): Promise<void>

  /**
   * Builds and returns a template file that can be downloaded and filled in
   */
  buildTemplate(): Promise<string>
}

export abstract class AbstractBatchJobStrategy
  extends TransactionBaseService
  implements IBatchJobStrategy
{
  static _isBatchJobStrategy = true
  static identifier: string
  static batchType: string


  static isBatchJobStrategy(object): object is IBatchJobStrategy {
    return object?.constructor?._isBatchJobStrategy
  }

  async prepareBatchJobForProcessing(
    batchJob: CreateBatchJobInput,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: Express.Request
  ): Promise<CreateBatchJobInput> {
    return batchJob
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async preProcessBatchJob(batchJobId: string): Promise<void> {
    return
  }

  public abstract processJob(batchJobId: string): Promise<void>

  public abstract buildTemplate(): Promise<string>
}