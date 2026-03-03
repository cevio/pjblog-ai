import IoredisService from "@hile/ioredis";
import { defineController } from "@hile/http";
import { generate } from 'randomstring';
import { createHash } from 'crypto';
import { loadService } from "@hile/core";
import { RequestBodyMiddleware } from "../../../middlewares/request-body.middle";
import { HttpException } from "../../../lib/http-error";
import { EMAIL_REGEXP } from "../../../lib/regexp";
import { MailerService } from "../../../services/mailer.service";
import { createRateLimitMiddleware } from "../../../middlewares/rate-limit.middle";

export const buildCaptchaKey = (ticket: string) => {
  return `${process.env.REDIS_PREFIX}:captcha:${ticket}`;
}

export enum CAPTCHA_ACTION {
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

/**
 * 路由 `/-/auth/captcha`
 * 
 * 请求体：
 * body: {
 *   email: string,
 *   action: CAPTCHA_ACTION
 * }
 * 
 * 返回：
 * string: 验证码 ticket
 * 
 * 验证码 ticket 格式：
 * `${process.env.REDIS_PREFIX}:captcha:${ticket}`
 * 
 * 验证码 ticket 过期时间：
 * 60 * 5 秒
 * 
 * 验证码 ticket 保存到 Redis 中，key 为验证码 ticket，value 为 JSON 字符串，格式为：
 * {
 *   email: string,
 *   action: CAPTCHA_ACTION,
 *   code: string
 * }
 * 
 * 发送邮件：
 * 邮件标题：验证码
 * 邮件内容：您的验证码是：${code}，请在5分钟内使用。
 */
export default defineController('POST', [
  RequestBodyMiddleware,
  createRateLimitMiddleware({
    duration: 60,
    max: 2,
    namespace: 'captcha'
  })
], async (ctx) => {
  const { email, action } = ctx.request.body as {
    email: string,
    action: CAPTCHA_ACTION
  };

  // 邮箱和操作不能为空
  if (!email || !action) {
    throw new HttpException(400, '邮箱和操作不能为空');
  }

  // 邮箱格式不正确
  if (!EMAIL_REGEXP.test(email)) {
    throw new HttpException(400, '邮箱格式不正确');
  }

  // 操作不正确
  if (![CAPTCHA_ACTION.LOGIN, CAPTCHA_ACTION.RESET_PASSWORD].includes(action)) {
    throw new HttpException(400, '操作不正确');
  }

  const code = generate(6);
  const md5 = createHash('md5').update(`${email}:${action}:${code}`).digest('hex');
  const ticket = buildCaptchaKey(md5);

  const redis = await loadService(IoredisService);
  const mailer = await loadService(MailerService);

  // 发送邮件
  await mailer.sendText(email, '验证码', `您的验证码是：${code}，请在5分钟内使用。`);
  // 保存到 Redis
  await redis.setex(ticket, 60 * 5, JSON.stringify({ email, action, code }));

  return md5;
})