import { defineController } from '@hile/http'

/**
 * 健康检查接口。
 * 用于确认 HTTP 服务已成功启动。
 */
export default defineController('GET', async () => {
  return {
    name: 'pjblog',
    status: 'ok',
    message: '服务启动成功',
  }
})