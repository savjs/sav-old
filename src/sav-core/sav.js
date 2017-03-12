import {EventEmitter} from 'events'
import {routerPlugin} from './plugins'
import compose from 'koa-compose'
import {isPromise, isAsync} from './utils/type'

export class Router extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {...opts}
    this.matchRoute = null
    this.payloads = []
    this.orders = [
      'auth',
      'hreq',
      'req',
      'route',
      'hres',
      'res',
      'vue',
      'view'
    ]
    if (!this.opts.noRoute) {
      this.use(routerPlugin)
    }
  }
  order (name, opts = {}) {
    if (opts.after) {
      orderBy(name, opts.after, false, this.orders)
    }
    if (opts.before) {
      orderBy(name, opts.before, true, this.orders)
    }
  }
  config (name, dval) {
    return name in this.opts ? this.opts[name] : dval
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

function orderBy (src, target, before, orders) {
  let index = orders.indexOf(target)
  if (~index) {
    let curr = orders.indexOf(src)
    if (~curr) {
      orders.splice(curr, 1)
      if (index > curr) {
        index--
      }
    }
    orders.splice(before ? index : index + 1, 0, src)
  }
  return orders
}

function createMiddleware (action, ctx) {
  let {middlewares, steps} = action
  let orders = ctx.orders
  let middleware = action.middleware
  for (let it of orders) {
    if (typeof middleware[it] === 'function') {
      middlewares.push(middleware[it])
      steps.push(it)
    }
  }
  return middlewares
}

function buildModules (ctx, modules) {
  for (let module of modules) {
    module.ctx = ctx
    ctx.emit('module', module)
    for (let actionName in module.actions) {
      let action = module.actions[actionName]
      action.module = module
      action.ctx = ctx
      action.middleware = {}
      action.middlewares = []
      action.steps = []
      action.set = setActionMiddleware.bind(action)
      ctx.emit('action', action)
      createMiddleware(action, ctx)
    }
  }
}

function setActionMiddleware (name, value) {
  if (typeof name === 'object') {
    for (let it in name) {
      this.middleware[it] = name[it]
    }
  } else {
    this.middleware[name] = value
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
      if (isAsync(ctx)) {
        await middleware(ctx)
      } else {
        let ret = middleware(ctx)
        if (ret && isPromise(ret)) {
          await ret
        }
      }
    }
  } else {
    await next()
  }
}
