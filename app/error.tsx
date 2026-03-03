'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 600, padding: 24 }}>
            <h1>页面发生错误</h1>
            <p style={{ color: '#64748b' }}>{error.message || '未知错误'}</p>
            <button type="button" onClick={reset} style={{ padding: '8px 16px' }}>
              重试
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
