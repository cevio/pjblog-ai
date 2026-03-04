import { Middleware } from "koa";
import { loadService } from "@hile/core";
import { nextAppService } from "../services/next-app.service";

export async function createNextStaticMiddleware(): Promise<Middleware> {
  const run = await loadService(nextAppService);
  return async (ctx, next) => {
    // 中文注释：保留现有 API 路由给 hile 控制器处理。
    if (ctx.path.startsWith('/-')) {
      await next()
      return
    }

    // 中文注释：其余路由全部交给 Next（包含 / 与 /_next/*）。
    ctx.status = 200
    ctx.res.statusCode = 200
    ctx.respond = false
    await run(ctx.req, ctx.res);
  }
}