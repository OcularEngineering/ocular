import { AppNameDefinitions, RateLimiterOpts } from "@ocular/types";
import { RateLimiterService } from "@ocular/ocular";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";

export default async (container, options) => {
  try {
    // Register Rate Limiter For Confluence App
    if (!options.rate_limiter_opts) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        "registerRateLimiter: No options provided for rate limiter for Confluence App"
      );
    }
    const rateLimiterOpts: RateLimiterOpts = options.rate_limiter_opts;
    const rateLimiterService: RateLimiterService =
      container.resolve("rateLimiterService");
    await rateLimiterService.register(
      AppNameDefinitions.CONFLUENCE,
      rateLimiterOpts.requests,
      rateLimiterOpts.interval
    );
  } catch (err) {
    throw new AutoflowAiError(
      AutoflowAiErrorTypes.INVALID_DATA,
      "registerRateLimiter: Failed to register rate limiter for Confluence App with error: " +
        err.message
    );
  }
};
