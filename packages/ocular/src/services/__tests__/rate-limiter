import { after } from 'node:test';
import RateLimiterService from '../rate-limiter'
import  Redis from 'ioredis';

describe('queueService', () => {
  let rateLimiterService: RateLimiterService;
  let redis: Redis;
  beforeAll(async () => {
    try{
      redis = new Redis("redis://localhost:6379", {
        // Lazy connect to properly handle connection errors
        lazyConnect: true,
        maxRetriesPerRequest: null, // Add this line
      })

      try {
        await redis.connect()
      } catch (err) {
        console.log(`An error occurred while connecting to Redis:${err}`)
      }
  

      const moduleDeps = {
        redisClient: redis,
      }
     rateLimiterService = new RateLimiterService(moduleDeps);
    } catch (error) {
      console.log('Error Instantiating The Rate Limiter Service', error)
    }
    });

    afterAll(async () => {
      await redis.disconnect();
    })

    it('it should rate limit an api', async () => {
      // Register a rate limiter for an ocular api to allow 5 requests per second
      await rateLimiterService.register("ocular", 5, 1);
      const requestQueue = await rateLimiterService.getRequestQueue("ocular");
      expect(requestQueue).toBeDefined();
      
      // Consume 14 tokens from the rate limiter queue at a rate of 5 tokens per second
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 14; i++) {
        const promise = requestQueue.removeTokens(1,"ocular")
          .then((rateLimiterRes) => {
            console.log('Rate Limit Remaining', rateLimiterRes)
          }).catch((error) => {
            console.log('Error Consuming Rate Limit', error)
          });
        promises.push(promise);
      }
      
      // Wait for all promises to complete
     await Promise.all(promises)
    });
  }
)