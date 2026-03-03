import { Middleware } from 'koa';
import { HttpException } from '../lib/http-error';
export const CatchErrorMiddleware: Middleware = async (ctx, next) => {
  try {
    await next()
    ctx.body = {
      code: 200,
      data: ctx.body,
    }
  }
  catch (error: any) {
    ctx.status = 200;
    if (error instanceof HttpException) {
      ctx.body = {
        code: error.status,
        message: error.message,
      }
    } else {
      ctx.body = {
        code: error.status || 500,
        message: error.message || '服务器错误'
      }
    }
  }
}