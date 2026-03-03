export default function Page() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      }}
    >
      <div
        style={{
          width: 560,
          padding: 32,
          borderRadius: 16,
          background: '#fff',
          boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
          border: '1px solid rgba(37,99,235,0.15)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Next.js 集成成功</h1>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.8 }}>
          这个页面由 Next.js App Router 渲染，并挂载到现有 hile 服务中。
          <br />
          访问路径：<code>/next</code> 或 <code>/next/*</code>
        </p>
      </div>
    </main>
  )
}
