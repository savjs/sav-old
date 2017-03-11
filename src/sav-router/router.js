import {EventEmitter} from 'events'
import {routerPlugin} from './plugin.js'
import compose from 'koa-compose'

export class Router extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {...opts}
    this.matchRoute = null
    this.payloads = []
    if (!this.opts.noRoute) {
      this.use(routerPlugin)
    }
  }
  config (name) {
    return this.opts[name]
  }
  use (plugin) {
    if (typeof plugin === 'function') {
      plugin(this)
    } else if (typeof plugin === 'object') {
      for (let name in plugin) {
        if (name === 'payload') {
          this.payloads.push(plugin[name])
        } else {
          this.on(name, plugin[name])
        }
      }
    }
  }
  declare (modules) {
    if (!Array.isArray(modules)) {
      modules = [modules]
    }
    buildModules(this, modules)
  }
  route () {
    let payloads = [payloadStart.bind(this)].concat(this.payloads).concat([payloadEnd.bind(this)])
    let payload = compose(payloads)
    return payload
  }
  warn (...args) {
    this.emit('warn', ...args)
  }
}

function buildModules (ctx, modules) {
  let moduleCtx = {ctx}
  for (let module of modules) {
    ctx.emit('module', module, moduleCtx)

    let actionCtx = {ctx, module}
    for (let actionName in module.actions) {
      let action = module.actions[actionName]
      let middlewares = []
      ctx.emit('action', action, actionCtx)

      let middlewareCtx = {ctx, module, action, middlewares}
      for (let middleware of action.middleware) {
        let [name, ...args] = middleware
        ctx.emit('middleware', {name, args}, middlewareCtx)
      }
    }
  }
}

async function payloadStart (ctx, next) {
  ctx.end = (data, rewrite) => {
    if (ctx._end) {
      if (rewrite) {
        ctx._end.data = data
      }
    } else {
      ctx._end = {
        data
      }
    }
  }
  await next()
  if (ctx._end) {
    ctx.body = ctx._end.data
    ctx.end = ctx._end = null
  }
}

async function payloadEnd (ctx, next) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let matched = this.matchRoute(path, method)
  if (matched) {
    let [route, params] = matched
    ctx.params = params
    for (let middleware of route.middlewares) {
      await middleware(ctx)
    }
  } else {
    await next()
  }
}
