import Redis from "ioredis"
import { TransactionBaseService } from "@ocular/types"

type RateLimiterServiceProps = {
  redisClient: Redis
}

/**
 * Stores Rate Limiters For Apps In Ocular
 */
class RateLimiterService extends TransactionBaseService {
  protected apiToRateLimiterMap_: Map <string, RateLimiterRedis> = new Map()
  protected redisClient_: Redis

  constructor({  redisClient }: RateLimiterServiceProps) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.redisClient_ = redisClient
  }

  protected storeRateLimiters({
    apiName,
    limiter
  }: {
    apiName: string
    limiter: RateLimiterRedis
  }) {
    const existingLimiters = this.apiToRateLimiterMap_.get(apiName) ?? []
    if (existingLimiters) {
      throw Error(`Limiter with ${apiName} already exists`)
    }
    this.apiToRateLimiterMap_.set(apiName, limiter)
  }
  
  async register(apiName:string, opts?:RateLimiterOpts): Promise<void>{
    const rateLimiter= new RateLimiterRedis({keyPrefix: apiName, ...opts})
    // Check Connection
    this.storeRateLimiters(apiName,rateLimiter)
  }

  async retrieve(apiName: string): Promise<RateLimiterRedis> {
    return this.apiToRateLimiterMap_.get(apiName)
  }
}

export default RateLimiterService