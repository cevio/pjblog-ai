import type { Middleware } from 'koa'
import { AuthUserMiddleware } from './auth_user.middle';
import { HttpException } from '../../lib/http-error';

export const AuthLoginMiddleware: Middleware = async (ctx, next) => {
  await AuthUserMiddleware(ctx, async () => {
    if (!ctx.user) {
      throw new HttpException(401, '未登录');
    }
    await next();
  });
}