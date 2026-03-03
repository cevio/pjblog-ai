import { Middleware } from "koa";

export const ResponseTimeMiddleware: Middleware = async (ctx, next) => {
  const startAt = Date.now()
  await next()
  ctx.set('X-Response-Time', `${Date.now() - startAt}ms`)
}