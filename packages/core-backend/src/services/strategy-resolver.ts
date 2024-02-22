import { TransactionBaseService } from "@ocular-ai/types/"
import { EntityManager } from "typeorm"
import { AutoflowAiError, AutoflowContainer } from "@ocular-ai/utils"
import {AbstractBatchJobStrategy} from "../interfaces"


export default class StrategyResolver extends TransactionBaseService {
  protected readonly logger_: any
  protected readonly container_: any
  constructor(container) {
    super(container)
    this.logger_ = container.logger
    this.container_ = container
  }

  resolveBatchJobByType(type: string): AbstractBatchJobStrategy {
    let resolved: AbstractBatchJobStrategy
    try {
      console.log(this.container_)
      resolved = this.container_[`${type}Strategy`]
    } catch (e) {
      throw new AutoflowAiError (
        AutoflowAiError.Types.NOT_FOUND,
        `Unable to find a BatchJob strategy with the type ${e}`
      )
    }
    return resolved
  }
}