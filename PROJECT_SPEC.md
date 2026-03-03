# PJBlog 开发规范（基于当前会话确认）

> 本文档用于固化我与开发助手在当前会话中确认的技术约束与实现规则，后续开发默认遵循本文档。

## 1. 架构与基础约束

1. 必须使用 `hile` 架构进行实现。
2. skills 已安装（`cevio/hile`），实现时需遵守：
   - `@hile/core`
   - `@hile/http`
   - `@hile/cli`
   - `@hile/typeorm`
   - `@hile/ioredis`
3. 前端实现必须严格遵守 `@.claude/skills` 中以下规范：
   - `frontend-design`
   - `vercel-react-best-practices`
4. 启动入口约束：**仅** `http.boot.ts` 自启动。
5. 其他能力统一放在 `services` 中，通过容器按需加载，不新增其他 boot 自启动文件。

## 2. 数据库与 ORM

1. 使用 TypeORM，通过 `@hile/typeorm` 集成。
2. 开发环境从 `.env` 读取数据库配置。
3. 生产环境支持 TypeORM 支持的关系型数据库（由用户选择）。

### 2.1 当前确认的数据库实际参数

- type: `mysql`
- host: `127.0.0.1`
- port: `3306`
- username: `root`
- password: `fdnsyj211314`
- database: `pjblog-next`
- charset: `utf8mb4`
- entityPrefix: `pjblog_`

### 2.2 转换为 `@hile/typeorm` 所需 `.env` 键名

```env
TYPEORM_TYPE=mysql
TYPEORM_HOST=127.0.0.1
TYPEORM_PORT=3306
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=fdnsyj211314
TYPEORM_DATABASE=pjblog-next
TYPEORM_CHARSET=utf8mb4
TYPEORM_ENTITY_PREFIX=pjblog_
TYPEORM_ENTITIES=src/entities/*.entity.ts
```

> 说明：`TYPEORM_ENTITIES` 建议必须配置，否则实体列表可能为空。

## 3. Redis 配置

当前确认 Redis 参数：

- host: `127.0.0.1`
- port: `6379`
- db: `10`

转换为 `@hile/ioredis` 所需 `.env` 键名：

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=10
```

## 4. HTTP 配置

用户确认：`http.pot = 3000`（按语义为端口）。

项目 `.env` 采用：

```env
HTTP_PORT=3000
```

## 5. 认证与账号体系

1. 登录方式采用**邮箱验证码登录**。
2. 忘记密码复用邮箱验证码流程。
3. 登录体系需预留扩展能力，后续支持第三方登录（OAuth 等）。
4. 验证码存储使用 Redis（`@hile/ioredis`），不再落数据库表。
5. 验证码逻辑：
   - 系统生成随机验证码 `code`（默认 6 位，可数字或字母数字）。
   - 以 `code` 为 Redis key，value 保存 `email + action`（如 `LOGIN`），并设置过期时间。
   - 验证时通过 `code` 取出 value，校验 `email` 与 `action` 是否与当前操作一致。
   - 校验成功后立即删除该 `code`，确保一次性使用。

## 6. 用户与权限模型

角色：

- `SUPER_ADMIN`
- `ADMIN`
- `USER`

权限规则：

1. 普通用户可注册并发表评论。
2. 管理员可进行内容与评论审核管理。
3. 超级管理员可指定/回收普通管理员。

## 7. 评论审核策略

1. 当前采用“先审后发”。
2. 允许后续扩展为 AI 自动审核或 AI 辅助审核。

## 8. 内容与前端要求

1. 编辑器采用 Markdown。
2. 前端采用 React RSC 模式，以提升 SEO 表现。

## 9. 可扩展系统

1. 需要插件系统（扩展博客功能）。
2. 需要主题系统（切换博客界面）。

## 10. 代码风格与注释

1. 开发中尽量使用中文注释，便于人工检查。
2. 实现时避免虚构配置，优先使用已确认字段与 skill 规范。
3. 默认禁用 `any`，但 `try/catch` 场景中的 `error: any` 允许保留。
4. 凡是 `PUT` / `POST` / `TRACE` 路由，必须加上中间件 `RequestBodyMiddleware`。

## 11. 里程碑（执行顺序）

1. 搭建 `http.boot.ts` 启动入口与路由加载。
2. 落地 TypeORM 数据源服务与实体加载。
3. 实现邮箱验证码认证闭环（Redis 版）。
4. 完成文章与评论主流程（含先审后发）。
5. 完成 RBAC（含超级管理员授权管理员）。
6. 落地插件与主题最小可用能力。
7. 预留并接入 AI 审核扩展。
