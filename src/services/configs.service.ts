import IoredisService from '@hile/ioredis'
import { defineService, loadService } from "@hile/core";
import { z } from 'zod';

const ConfigsSchema = z.object({
  captcha_expire: z.number().int().describe('验证码过期时间(分钟)').default(60 * 5),
  login_expire: z.number().int().describe('用户登录过期时间(天)').default(30),
})

type ConfigsType = z.infer<typeof ConfigsSchema>;

/**
 * 基础配置服务。
 * 用于存储系统基础配置，如系统名称、系统描述、系统 logo 等。
 * 使用 Redis 存储，key 为 `${process.env.REDIS_PREFIX}:configs`，value 为 JSON 字符串。
 * 使用 Zod 进行数据验证。
 */
export const ConfigsService = defineService(async () => {
  const redis = await loadService(IoredisService);
  const key = `${process.env.REDIS_PREFIX || 'pjblog'}:configs`;
  const text = await redis.exists(key)
    ? await redis.get(key)
    : undefined;
  const configs: ConfigsType = text
    ? JSON.parse(text)
    : ConfigsSchema.parse({});

  return {
    schema: () => ConfigsSchema.toJSONSchema(),
    get value() { return configs; },
    save: () => redis.set(key, JSON.stringify(configs)),
    async set<T extends keyof ConfigsType>(_key: T, value: ConfigsType[T]) {
      const keys = Object.keys(configs);
      if (keys.includes(_key)) {
        configs[_key] = value;
        await redis.set(key, JSON.stringify(configs));
      }
    },
    async replace(data: Partial<ConfigsType> = {}) {
      const keys = Object.keys(configs);
      for (const _key in data) {
        if (keys.includes(_key)) {
          // @ts-ignore
          configs[_key] = data[_key];
        }
      }
      await redis.set(key, JSON.stringify(configs));
    }
  }
})