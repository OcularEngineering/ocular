import Redis from "ioredis"
import { RateLimiterRedis, RateLimiterQueue } from "rate-limiter-flexible"
import { RateLimiterOpts } from "../types"
import { TransactionBaseService } from "@ocular/types"
import { AutoflowAiError } from "@ocular/utils"

type RateLimiterServiceProps = {
  redisClient: Redis
}

/**
 * Stores Rate Limiters For Apps In Ocular
 */
class RateLimiterService extends TransactionBaseService {
  protected apiToRateLimiterMap_: Map <string, RateLimiterQueue> = new Map()
  protected redisClient_: Redis

  constructor({  redisClient }: RateLimiterServiceProps) {
    super(arguments[0])
    this.redisClient_ = redisClient
  }

  protected storeRateLimiterQueues({
    apiName,
    limiterQueue,
  }: {
    apiName: string
    limiterQueue: RateLimiterQueue
  }) {
    this.apiToRateLimiterMap_.set(apiName, limiterQueue)
  }

  
  async register(apiName:string , points: number, duration: number): Promise<void> {
    try {
      const rateLimiter = new RateLimiterRedis({storeClient: this.redisClient_, keyPrefix: apiName, points: points, duration: duration})
      const limiterQueue = new RateLimiterQueue(rateLimiter);
      this.storeRateLimiterQueues({apiName, limiterQueue})
    } catch(e) {
      throw new AutoflowAiError (
        AutoflowAiError.Types.INVALID_DATA,
        `Failed to rate limiter for ${apiName} with ${e}`
      )
    }
  }

  async getRequestQueue(apiName: string): Promise<RateLimiterQueue> {
    return this.apiToRateLimiterMap_.get(apiName)
  }
}

export default RateLimiterService