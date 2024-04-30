export interface RateLimiterOpts{
  requests: number // Number of requests
  interval: number, // Per second(s)
}