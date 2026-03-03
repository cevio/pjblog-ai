import { Middleware } from 'koa';
import { koaBody } from 'koa-body'

export const RequestBodyMiddleware: Middleware = koaBody();