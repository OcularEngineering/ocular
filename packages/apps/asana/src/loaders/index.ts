import { AppNameDefinitions,  RateLimiterOpts} from "@ocular/types";
import { RateLimiterService} from "@ocular/ocular";

export default async (container, options) => {
  try {
    // Register Rate Limiter For Google Drive
    if (!options.rate_limiter_opts) {
      throw new Error("No options provided for rate limiter")
    }
    const rateLimiterOpts: RateLimiterOpts = options.rate_limiter_opts
    const rateLimiterService: RateLimiterService = container.resolve("rateLimiterService")
    await rateLimiterService.register(AppNameDefinitions.ASANA,rateLimiterOpts.requests, rateLimiterOpts.interval);
  } catch (err) {
    throw(err)
  }
}