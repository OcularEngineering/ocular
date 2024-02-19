import { BatchJob } from "../models"
import { BatchJobService } from "../services"
import { BatchJobResultError, CreateBatchJobInput } from "../types/batch-job"
import { TransactionBaseService } from "@ocular-ai/types"

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

  protected abstract batchJobService_: BatchJobService

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

  protected async shouldRetryOnProcessingError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    batchJob: BatchJob,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    err: unknown
  ): Promise<boolean> {
    return false
  }

  protected async handleProcessingError<T>(
    batchJobId: string,
    err: unknown,
    result: T
  ): Promise<void> {
    // TODO just throw to be handled by the subscriber
    return await this.atomicPhase_(async (transactionManager) => {
      const batchJob = (await this.batchJobService_
        .withTransaction(transactionManager)
        .retrieve(batchJobId))

      const shouldRetry = await this.shouldRetryOnProcessingError(batchJob, err)

      const errMessage =
        (err as { message: string }).message ??
        `Something went wrong with the batchJob ${batchJob.id}`
      const errCode = (err as { code: string | number }).code ?? "unknown"
      const resultError = { message: errMessage, code: errCode, err }

      if (shouldRetry) {
        const existingErrors =
          batchJob?.result?.errors ?? ([] as BatchJobResultError[])
        const retryCount = batchJob.context.retry_count as number ?? 0

        await this.batchJobService_
          .withTransaction(transactionManager)
          .update(batchJobId, {
            context: {
              retry_count: retryCount + 1,
            },
            result: {
              ...result,
              errors: [...existingErrors, resultError.message],
            },
          })
      } else {
        await this.batchJobService_
          .withTransaction(transactionManager)
          .setFailed(batchJob, resultError)
      }
    })
  }
}