import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 中文注释：当前通过 hile 中间件进行 /next 前缀改写，这里不设置 basePath。
  // 中文注释：开发期允许常见本地域名访问 Next 资源，消除 allowedDevOrigins 警告。
  allowedDevOrigins: ['127.0.0.1', 'localhost', '::1'],
  // 中文注释：固定追踪根目录为当前项目，避免多 lockfile 时误判到上级目录。
  outputFileTracingRoot: rootDir,
}

export default nextConfig
