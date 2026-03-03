import LoginClient from '../ui/login-client'
import styles from './page.module.css'

/**
 * 登录页（Server Component）。
 * 中文注释：采用更贴近通用平台的简洁邮箱登录布局。
 */
export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard} aria-label="邮箱登录">
        <header className={styles.loginHeader}>
          <div className={styles.brand}>PJBlog</div>
          <h1>登录你的账号</h1>
          <p>使用邮箱验证码安全登录</p>
        </header>

        <LoginClient />

        <footer className={styles.loginFooter}>
          登录即表示你同意服务条款与隐私政策
        </footer>
      </section>
    </main>
  )
}
