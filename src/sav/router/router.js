import {EventEmitter} from 'events'
import compose from 'koa-compose'

import {isArray, isObject, isFunction, makeProp, prop} from '../util'
import {Config} from '../core/config'
import {Exception} from '../core/exception.js'
import {matchModulesRoute} from './matchs.js'
import {executeMiddlewares} from './executer.js'
import {routePlugin} from '../plugins/route.js'

export class Router extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    this.config = config    // 配置
    this.executer = null    // 执行器
    this.payloads = []      // 插件
    this.modules = {}       // 模块
    this.moduleActions = {}     // 模块动作
    this.moduleRoutes = []      // 模块路由
    this.routes = {}            // 模块路由
    this.use(routePlugin)
  }
  use (plugin) {
    if (isFunction(plugin)) {
      plugin(this)
    } else if (isObject(plugin)) {
      for (let name in plugin) {
        if (name === 'payload') {
          this.payloads.push(plugin[name])
        } else {
          this.on(name, plugin[name])
        }
      }
    }
    return this
  }
  declare (modules) {
    walkModules(this, isArray(modules) ? modules : [modules])
  }
  compose () {
    let payloads = [payloadStart.bind(this)].concat(this.payloads).concat([payloadEnd.bind(this)])
    let payload = compose(payloads)
    return async (ctx, next) => {
      try {
        await payload(ctx)
      } catch (e) {
        throw new Exception(e)
      }
      return next()
    }
  }
  async exec (ctx) {
    if (this.executer) {
      return await this.executer(ctx)
    }
    this.executer = this.compose()
    return await this.executer(ctx)
  }
  matchRoute (path, method) {
    let ret = matchModulesRoute(this.moduleRoutes, path, method)
    return ret && JSON.parse(JSON.stringify(ret))
  }
  matchContextRoute (ctx) {
    let method = ctx.method.toUpperCase()
    let path = ctx.path || ctx.originalUrl
    let matched = this.matchRoute(path, method)
    if (matched) {
      let [route, params] = matched
      ctx.route = route
      ctx.params = params
    }
    return matched
  }
  payload (ctx) {
    makeProp(ctx)
    makeState(ctx)
    makePromise(ctx)
    makeRender(ctx)
    makeSav(ctx, this)
  }
}

function walkModules (router, modules) {
  for (let module of modules) {
    let {uri} = module
    makeProp(module, false)
    for (let route of module.routes) {
      let middlewares = []
      makeProp(route, false)({
        middlewares,
        props: route.tasks.reduce((obj, it) => {
          prop(it, 'setMiddleware', (middleware) => {
            it.middleware = middleware
          })
          obj[it.name] = it
          middlewares.push(it)
          return obj
        }, {})
      })
      router.routes[route.uri] = route
    }
    router.modules[uri] = module
    router.emit('module', module)
    for (let route of module.routes) {
      router.emit('route', route)
    }
    if (module.SavRoute) { // 服务端路由处理
      router.moduleRoutes.push(module.SavRoute)
    }
    if (module.actions) { // 模块方法表
      router.moduleActions[uri] = module.actions
    }
  }
}

export async function payloadStart (ctx, next) {
  this.payload(ctx)
  // 匹配路由
  this.matchContextRoute(ctx)
  await next()
}

class NotRoutedException extends Exception {}

export async function payloadEnd (ctx) {
  if (!ctx.route) {
    throw new NotRoutedException('Not routed')
  }
  // 路由中间件
  await executeMiddlewares(this.routes[ctx.route.uri].middlewares, ctx)
  // 渲染
  await ctx.render()
}

function proxyModuleActions (ctx, modules) {
  let cache = {}
  let proxy = new Proxy(modules, {
    get (target, moduleName) {
      if (target.hasOwnProperty(moduleName)) {
        let module = target[moduleName]
        if (cache[moduleName]) {
          return cache[moduleName]
        }
        let proxyModule = new Proxy(module, {
          get (target, actionName) {
            if (target.hasOwnProperty(actionName)) {
              let cacheName = `${moduleName}.${actionName}`
              if (cache[cacheName]) {
                return cache[cacheName]
              }
              let fn = target[actionName]
              if (isFunction(fn)) {
                let proxyAction = cache[cacheName] = async () => {
                  let args = [].slice.call(arguments)
                  args.unshift(ctx)
                  return fn.apply(proxyModule, args)
                }
                return proxyAction
              }
            }
          }
        })
        cache[moduleName] = proxyModule
        return proxyModule
      }
    }
  })
  return proxy
}

function makeSav (ctx, router) {
  ctx.prop({
    sav: proxyModuleActions(ctx, router.moduleActions),
    async dispatch (uri) {
      return ctx.sav[(uri = uri.split('.')).shift()][uri.shift()]()
    }
  })
}

export function makeState (ctx) {
  let prop = ctx.prop
  let state = {}
  prop.getter('state', () => state)
  prop('setState', (...args) => {
    let len = args.length
    if (len < 1) {
      return
    } else if (len === 1) {
      if (Array.isArray(args[0])) { // for Promise.all
        args = args[0]
      } else {
        state = {...state, ...args[0]}
        return
      }
    }
    args.unshift(state)
    state = Object.assign.apply(state, args)
  })
  prop('replaceState', (newState) => {
    state = newState || {}
  })
}

export function makePromise (ctx, Promiser) {
  Promiser || (Promiser = Promise)
  ctx.prop({
    resolve: Promiser.resolve.bind(Promiser),
    reject: Promiser.reject.bind(Promiser),
    all: Promiser.all.bind(Promiser),
    then: (fn, fail) => {
      return new Promiser(fn, fail)
    }
  })
}

export function makeRender (ctx) {
  let renderers = {
    json (ctx) {
      ctx.body = ctx.state
    }
  }
  ctx.prop({
    renderEngine: 'json',
    renderer: renderers.json,
    renderers,
    renderOptions: null,
    setViewEngine: (renderer, type, opts) => {
      ctx.renderer = renderer
      ctx.renderEngine = type || renderer.name
      ctx.renderOptions = opts
    },
    async render () {
      return ctx.renderer(ctx, ctx.renderOptions)
    }
  })
}
