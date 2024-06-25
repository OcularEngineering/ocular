import { AppNameDefinitions, RateLimiterOpts } from "@ocular/types";
import { RateLimiterService } from "@ocular/ocular";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";

export default async (container, options) => {
  try {
    // Register Rate Limiter For Google Drive
    if (!options.rate_limiter_opts) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        "registerRateLimiter: No options provided for rate limiter for Jira App"
      );
    }
    const rateLimiterOpts: RateLimiterOpts = options.rate_limiter_opts;
    const rateLimiterService: RateLimiterService =
      container.resolve("rateLimiterService");
    await rateLimiterService.register(
      AppNameDefinitions.JIRA,
      rateLimiterOpts.requests,
      rateLimiterOpts.interval
    );
  } catch (err) {
    throw new AutoflowAiError(
      AutoflowAiErrorTypes.INVALID_DATA,
      "registerRateLimiter: Failed to register rate limiter for Jira App with error: " +
        err.message
    );
  }
};
