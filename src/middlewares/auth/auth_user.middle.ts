import type { Middleware } from 'koa'
import { loadService } from '@hile/core'
import IoredisService from '@hile/ioredis'
import TypeormService from '@hile/typeorm'
import { HttpException } from '../../lib/http-error'
import { UserEntity } from '../../entities/user.entity'

/**
 * 登录鉴权中间件。
 *
 * 校验逻辑：
 * 1. 从 cookie 读取 token
 * 2. 到 Redis 查询 token 对应的用户 ID
 * 3. 查询数据库获取完整用户信息
 * 4. 将用户信息挂到 ctx.user，供后续接口使用
 */
export const AuthUserMiddleware: Middleware = async (ctx, next) => {
  const token = ctx.cookies.get('token')
  if (!token) {
    throw new HttpException(401, '未登录')
  }

  const redis = await loadService(IoredisService)
  const key = `${process.env.REDIS_PREFIX || 'pjblog'}:auth:token:${token}`
  const userId = await redis.get(key)

  if (!userId) {
    throw new HttpException(401, '登录已失效，请重新登录')
  }

  const ds = await loadService(TypeormService)
  const userRepo = ds.getRepository(UserEntity)
  const user = await userRepo.findOneBy({ id: Number(userId) })

  if (user) {
    ctx.user = user;
  }

  await next()
}
