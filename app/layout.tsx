import React, { type ReactNode } from 'react'

export const metadata = {
  title: 'PJBlog Next Demo',
  description: 'Next.js 挂载到 hile 服务的演示页面',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, PingFang SC, Microsoft YaHei, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  )
}
