import { defineService } from '@hile/core'
import { Http } from '@hile/http'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CatchErrorMiddleware } from '../middlewares/error-catch.middle'
import { ResponseTimeMiddleware } from '../middlewares/response-time.middle'
import { parseEnvNumber, parseEnvKeys } from '../lib/env'

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
