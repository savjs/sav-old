import {EventEmitter} from 'events'
import compose from 'koa-compose'

import {isArray, isObject, isFunction, makeProp, prop, promise} from '../util'
import {Config} from '../core/config'
import {NotRoutedException} from '../core/exception.js'
import {matchModulesRoute} from './matchs.js'
import {executeMiddlewares} from './executer.js'
import {proxyModuleActions} from './proxy.js'
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
    // @TODO 异常处理 渲染引擎
    let payloads = [payloadStart.bind(this)].concat(this.payloads).concat([payloadEnd.bind(this)])
    let payload = compose(payloads)
    return async (ctx, next) => {
      let exp = false
      try {
        await payload(ctx)
      } catch (err) {
        exp = err
        if (this.isExecuteMode) {
          throw err
        }
        await this.render(ctx, err)
      }
      if (!exp) {
        await this.render(ctx)
      }
    }
  }
  async exec (ctx) {
    this.executer || (this.executer = this.compose())
    await this.executer(ctx)
    return ctx
  }
  async render (ctx, err) {
    return ctx.render(err)
  }
  get isExecuteMode () {
    return !!this.executer
  }
}

export function matchContextRoute (ctx, router) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let matched = matchModulesRoute(router.moduleRoutes, path, method)
  if (matched) {
    matched = JSON.parse(JSON.stringify(matched))
    let [route, params] = matched
    ctx.route = route
    ctx.params = params
  }
  return matched
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
    if (module.moduleGroup === 'Layout') {
      // 合并layout模块下的invoke中间件
      let middlewares = module.routes.reduce((ret, route) => {
        let arr = route.middlewares.reduce((queue, item) => {
          if (item.name === 'invoke') { // 只处理invoke之后的中间件, 目前也只有schema
            queue.push(0)
          } else if (queue.length) {
            if (isFunction(item.middleware)) {
              queue.push(item)
            }
          }
          return queue
        }, [])
        arr.shift()
        if (arr.length) {
          return ret.concat(arr)
        }
        return ret
      }, [])
      module.middlewares = middlewares
    }
  }
}

export function initSav (ctx, router) {
  makeProp(ctx)
  makeSav(ctx, router)
  makeRender(ctx)
}

export async function payloadStart (ctx, next) {
  initSav(ctx, this)
  // 匹配路由
  matchContextRoute(ctx, this)
  if (!ctx.route) {
    throw new NotRoutedException('Not routed')
  }
  await next()
}

export async function payloadEnd (ctx) {
  await Promise.all([
    // 路由
    executeMiddlewares(this.routes[ctx.route.uri].middlewares, ctx),
    // 布局并行
    executeModuleLayout(ctx, this)
  ])
}

async function executeModuleLayout (ctx, router) {
  let moduleName = ctx.route.uri.split('.').shift()
  let module = router.modules[moduleName]
  if (module && module.props.layout) {
    let layout = router.modules[module.props.layout]
    if (layout) {
      await ctx.sav[module.props.layout].invoke()
      return executeMiddlewares(layout.middlewares, ctx)
    }
  }
}

function makeSav (ctx, router) {
  // 注入 state promise sav 等
  let prop = ctx.prop
  let state = {}
  prop.getter('state', () => state)
  prop(Object.assign({
    sav: proxyModuleActions(ctx, router.moduleActions),
    async dispatch (uri) {
      return ctx.sav[(uri = uri.split('.')).shift()][uri.shift()]()
    },
    setState (...args) {
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
    },
    replaceState (newState) {
      state = newState || {}
    }
  }, promise))
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
