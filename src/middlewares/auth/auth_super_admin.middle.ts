import type { Middleware } from 'koa';
import { AuthAdminMiddleware } from './auth_admin.middle';
import { HttpException } from '../../lib/http-error';
import { USER_ROLE } from '../../entities/user.entity';
export const AuthSuperAdminMiddleware: Middleware = async (ctx, next) => {
  await AuthAdminMiddleware(ctx, async () => {
    if (ctx.user!.role !== USER_ROLE.SUPER_ADMIN) {
      throw new HttpException(403, '权限不足');
    }
    await next();
  });
}