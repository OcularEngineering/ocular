import { TransactionBaseService } from "@ocular-ai/types/"
import { EntityManager } from "typeorm"
import { AutoflowAiError } from "@ocular-ai/utils"
import AbstractBatchJobStrategy from "./batch-job"

type InjectedDependencies = {
  manager: EntityManager
  [key: string]: unknown
}

export default class StrategyResolver extends TransactionBaseService {
  constructor(protected readonly container: InjectedDependencies) {
    super(container)
  }

  resolveBatchJobByType(type: string): AbstractBatchJobStrategy {
    let resolved: AbstractBatchJobStrategy
    try {
      resolved = this.container[`batchType_${type}`] as AbstractBatchJobStrategy
    } catch (e) {
      throw new AutoflowAiError (
        AutoflowAiError.Types.NOT_FOUND,
        `Unable to find a BatchJob strategy with the type ${type}`
      )
    }
    return resolved
  }
}