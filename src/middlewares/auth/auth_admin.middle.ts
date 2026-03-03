import type { Middleware } from 'koa';
import { AuthLoginMiddleware } from './auth_login.middle';
import { HttpException } from '../../lib/http-error';
import { USER_ROLE } from '../../entities/user.entity';

export const AuthAdminMiddleware: Middleware = async (ctx, next) => {
  await AuthLoginMiddleware(ctx, async () => {
    if (![USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN].includes(ctx.user!.role)) {
      throw new HttpException(403, '权限不足');
    }
    await next();
  });
}