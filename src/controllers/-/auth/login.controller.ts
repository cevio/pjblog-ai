import IoredisService from "@hile/ioredis";
import TypeormService from "@hile/typeorm";
import { defineController } from "@hile/http";
import { RequestBodyMiddleware } from "../../../middlewares/request-body.middle";
import { HttpException } from "../../../lib/http-error";
import { EMAIL_REGEXP } from "../../../lib/regexp";
import { buildCaptchaKey, CAPTCHA_ACTION } from "./captcha.controller";
import { loadService } from "@hile/core";
import { UserEntity } from "../../../entities/user.entity";
import { generate } from "randomstring";

interface ILoginRequestBody {
  email: string;
  code: string;
  ticket: string;
}

/**
 * 路由 `/-/auth/login`
 * 
 * 请求体：
 * body: {
 *   email: string,
 *   code: string,
 *   ticket: string
 * }
 * 
 * 返回：
 * UserEntity: 用户信息
 * 
 * 验证码逻辑：
 * 1. 通过 ticket 获取验证码
 * 2. 验证码存在且未过期
 * 3. 验证码与请求体中的验证码一致
 * 4. 验证码与请求体中的邮箱一致
 * 5. 验证码与请求体中的操作一致
 * 
 * 如果用户不存在，则创建用户，并设置创建时间和更新时间
 * 如果用户存在，则更新更新时间
 * 
 * 生成 token 并保存到 Redis 中，key 为 `${process.env.REDIS_PREFIX}:auth:token:${token}`，value 为 user.id，过期时间 60 * 60 * 24 * 30 秒
 * 设置 cookie，key 为 `token`，value 为 token，过期时间 60 * 60 * 24 * 30 秒
 * 
 * 返回用户信息
 * 
 * 错误码：
 * 400: 邮箱和验证码不能为空
 * 400: 邮箱格式不正确
 * 400: 验证码已过期
 * 400: 验证码不正确
 * 400: 操作不正确
 * 400: 用户不存在
 * 400: 用户已存在
 * 400: 用户创建失败
 * 400: 用户更新失败
 */
export default defineController('POST', [RequestBodyMiddleware], async (ctx) => {
  const { email, code, ticket } = (ctx.request.body as ILoginRequestBody | undefined)! || {};

  if (!email || !code || !ticket) {
    throw new HttpException(400, '邮箱和验证码不能为空');
  }

  if (!EMAIL_REGEXP.test(email)) {
    throw new HttpException(400, '邮箱格式不正确');
  }

  const key = buildCaptchaKey(ticket);
  const redis = await loadService(IoredisService);

  if (!(await redis.exists(key))) {
    throw new HttpException(400, '验证码已过期');
  }

  const value = await redis.get(key);
  await redis.del(key);
  const { email: savedEmail, action, code: savedCode } = JSON.parse(value!) as {
    email: string,
    action: CAPTCHA_ACTION,
    code: string
  };
  if (savedEmail !== email || action !== CAPTCHA_ACTION.LOGIN || savedCode !== code) {
    throw new HttpException(400, '验证码不正确');
  }

  const ds = await loadService(TypeormService);
  const User = ds.manager.getRepository(UserEntity);
  let user = await User.findOneBy({ email });

  if (!user) {
    user = User.create();
    user.email = email;
  } else {
    user.updated_time = new Date();
  }

  await User.save(user);

  const token = generate(32);
  await redis.setex(`${process.env.REDIS_PREFIX}:auth:token:${token}`, 60 * 60 * 24 * 30, user.id.toString());
  ctx.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return user;
}) 