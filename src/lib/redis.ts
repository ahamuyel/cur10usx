let redis: any = null

// ioredis is not compatible with Edge Runtime
if (process.env.NEXT_RUNTIME !== "edge") {
  try {
    const Redis = require("ioredis")
    const redisUrl = process.env.REDIS_URL

    if (redisUrl) {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times: number) => {
          if (times > 3) return null
          return Math.min(times * 100, 2000)
        },
      })

      redis.on("error", (err: any) => {
        console.warn("Redis rate-limiter client error:", err.message)
      })
    }
  } catch (err) {
    // Silently fail if ioredis cannot be required (e.g. in some environments)
  }
}

export { redis }
