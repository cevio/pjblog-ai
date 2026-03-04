import { defineService, loadService } from '@hile/core'
import { Http } from '@hile/http'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CatchErrorMiddleware } from '../middlewares/error-catch.middle'
import { ResponseTimeMiddleware } from '../middlewares/response-time.middle'
import { parseEnvNumber, parseEnvKeys } from '../lib/env'
import { nextAppService } from '../services/next-app.service'

const __dirname = dirname(fileURLToPath(import.meta.url))
const controllers = resolve(__dirname, '../controllers')

export default defineService(async (shutdown) => {
  const http = new Http({
    port: parseEnvNumber(process.env.HTTP_PORT, 3000),
    keys: parseEnvKeys(process.env.HTTP_KEYS),
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
    maxParamLength: 100,
    allowUnsafeRegex: true,
    caseSensitive: true,
  })

  // 全局错误处理中间件（中文注释：统一错误返回结构）
  http.use(CatchErrorMiddleware)

  // 全局请求耗时响应头。
  http.use(ResponseTimeMiddleware)

  // 中文注释：挂载 Next.js 到根路径 /。
  const nextApp = await loadService(nextAppService)
  http.use(async (ctx, next) => {
    // 中文注释：保留现有 API 路由给 hile 控制器处理。
    if (ctx.path.startsWith('/-')) {
      await next()
      return
    }

    // 中文注释：其余路由全部交给 Next（包含 / 与 /_next/*）。
    ctx.status = 200
    ctx.res.statusCode = 200
    ctx.respond = false
    await nextApp.handle(ctx.req, ctx.res)
  })

  await http.load(controllers, {
    suffix: 'controller',
    defaultSuffix: '/index',
    conflict: 'error',
  })

  const close = await http.listen()
  shutdown(close)
  console.log(`http://127.0.0.1:${http.port}`)

  return http
})
