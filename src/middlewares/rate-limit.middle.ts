import { loadService } from '@hile/core'
import ioredisService from '@hile/ioredis'
import type { Middleware } from 'koa'
import ratelimit from 'koa-ratelimit'

interface RateLimitOptions {
  /** 时间窗口（毫秒） */
  duration?: number
  /** 窗口内最大请求次数 */
  max?: number
  /** Redis key 命名空间 */
  namespace?: string
  /** 自定义错误文案 */
  errorMessage?: string
}

/**
 * 使用 koa-ratelimit 创建限流中间件。
 *
 * 说明：
 * 1. 严格采用 koajs/ratelimit 的官方写法。
 * 2. Redis 客户端通过 @hile/ioredis 获取。
 */
export function createRateLimitMiddleware(options?: RateLimitOptions): Middleware {
  let resolved: Middleware | null = null
  let resolving: Promise<Middleware> | null = null

  const resolveMiddleware = async (): Promise<Middleware> => {
    if (resolved)
      return resolved

    if (resolving)
      return resolving

    resolving = (async () => {
      const redis = await loadService(ioredisService)

      const mw = ratelimit({
        driver: 'redis',
        // 中文注释：koa-ratelimit 的类型定义依赖旧版 ioredis 类型，这里做安全类型桥接。
        db: redis as unknown as NonNullable<Parameters<typeof ratelimit>[0]>['db'],
        duration: options?.duration ?? 60 * 1000,
        max: options?.max ?? 30,
        namespace: `${process.env.REDIS_PREFIX || 'pjblog'}:ratelimit:${options?.namespace ?? 'ip'}`,
        errorMessage: options?.errorMessage ?? '请求过于频繁，请稍后再试',
        id: ctx => ctx.ip,
        headers: {
          remaining: 'X-RateLimit-Remaining',
          reset: 'X-RateLimit-Reset',
          total: 'X-RateLimit-Limit',
        },
      })

      resolved = mw
      return mw
    })()

    return resolving
  }

  return async (ctx, next) => {
    const mw = await resolveMiddleware()
    await mw(ctx, next)
  }
}

/**
 * 默认限流中间件：60 秒最多 30 次。
 */
export const RateLimitMiddleware = createRateLimitMiddleware()
