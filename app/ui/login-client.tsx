'use client'

import { useMemo, useState } from 'react'
import { Alert, Button, Form, Input, Space, Typography } from 'antd'
import styles from './login-client.module.css'

type ApiResponse<T> = {
  code: number
  message?: string
  data: T
}

/**
 * 登录交互客户端组件。
 * 中文注释：仅处理发送验证码和登录请求，ticket 始终隐藏保存在内存状态。
 */
export default function LoginClient() {
  const [sending, setSending] = useState(false)
  const [logging, setLogging] = useState(false)
  const [ticket, setTicket] = useState('')
  const [tip, setTip] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const canSend = useMemo(() => !sending && countdown <= 0, [sending, countdown])

  const startCountdown = () => {
    let current = 60
    setCountdown(current)
    const timer = window.setInterval(() => {
      current -= 1
      setCountdown(current)
      if (current <= 0) {
        window.clearInterval(timer)
      }
    }, 1000)
  }

  const sendCaptcha = async (email: string) => {
    setSending(true)
    setError('')
    setTip('正在发送验证码，请稍候...')

    try {
      const res = await fetch('/-/auth/captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'login' }),
        credentials: 'include',
      })
      const json = (await res.json()) as ApiResponse<string>
      if (json.code !== 200 || !json.data) {
        throw new Error(json.message || '验证码发送失败')
      }

      // 中文注释：ticket 仅在内存中保存，不对用户暴露输入。
      setTicket(json.data)
      setTip('验证码已发送，请查收邮箱并输入验证码。')
      startCountdown()
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : '验证码发送失败'
      setError(message)
      setTip('')
    }
    finally {
      setSending(false)
    }
  }

  const doLogin = async (email: string, code: string) => {
    if (!ticket) {
      setError('请先发送验证码')
      return
    }

    setLogging(true)
    setError('')
    setTip('登录验证中，请稍候...')

    try {
      const res = await fetch('/-/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, ticket }),
      })

      const json = (await res.json()) as ApiResponse<unknown>
      if (json.code !== 200) {
        throw new Error(json.message || '登录失败')
      }

      setTip('登录成功，正在跳转...')
      window.location.href = '/'
    }
    catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      setError(message)
      setTip('')
    }
    finally {
      setLogging(false)
    }
  }

  return (
    <div className={styles.loginFormWrap}>
      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={values => {
          const email = String(values.email || '').trim()
          const code = String(values.code || '').trim()
          void doLogin(email, code)
        }}
      >
        <Form.Item
          label={<span className={styles.formLabel}>邮箱地址</span>}
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input
            size="large"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Form.Item>

        <Form.Item
          label={<span className={styles.formLabel}>邮箱验证码</span>}
          name="code"
          rules={[{ required: true, message: '请输入验证码' }]}
          className={styles.codeItem}
        >
          <Space.Compact className={styles.codeCompact}>
            <Input
              size="large"
              autoComplete="one-time-code"
              inputMode="numeric"
              placeholder="输入 6 位验证码"
            />
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const email = String(getFieldValue('email') || '').trim()
                return (
                  <Button
                    type="default"
                    size="large"
                    className={styles.captchaButton}
                    disabled={!canSend || !email}
                    loading={sending}
                    onClick={() => {
                      if (email)
                        void sendCaptcha(email)
                    }}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </Button>
                )
              }}
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Button
          htmlType="submit"
          type="primary"
          size="large"
          block
          loading={logging}
          className={styles.submitButton}
        >
          登录
        </Button>
      </Form>

      <div className={styles.alerts}>
        {tip ? <Alert showIcon type="info" description={tip} /> : null}
        {error ? <Alert showIcon type="error" description={error} className={tip ? styles.errorWithTip : undefined} /> : null}
      </div>

      <Typography.Paragraph className={styles.hintText}>
        未注册邮箱将自动创建账号。
      </Typography.Paragraph>
    </div>
  )
}
