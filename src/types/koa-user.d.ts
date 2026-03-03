import type { UserEntity } from '../entities/user.entity'

declare module 'koa' {
  interface DefaultContext {
    /**
     * 当前登录用户。
     * 在 AuthLoginMiddleware 校验通过后注入。
     */
    user?: UserEntity
  }
}

export {}
