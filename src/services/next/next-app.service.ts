import { defineService } from '@hile/core'
import next from 'next'

/**
 * Next.js 集成服务。
 *
 * 说明：
 * 1. 仅用于演示将 Next 页面挂载到现有 hile/koa 服务。
 * 2. 挂载前缀由 http.boot.ts 控制（当前为 /next）。
 */
export const nextAppService = defineService(async () => {
  const app = next({
    dev: process.env.NODE_ENV !== 'production',
    dir: process.cwd(),
  })

  await app.prepare()

  const handle = app.getRequestHandler()

  return {
    handle,
  }
})
