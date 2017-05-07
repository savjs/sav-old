import {EventEmitter} from 'events'
import compose from 'koa-compose'

import {isArray, isObject, isFunction, makeProp, delProps, prop, promise, ucfirst} from '../util'
import {Config} from '../core/config'
import {NotRoutedException} from '../core/exception.js'
import {matchModulesRoute} from './matchs.js'
import {executeMiddlewares} from './executer.js'
import {proxyModuleActions} from './proxy.js'
import {routePlugin} from '../plugins/route.js'
import {koaPlugin} from '../plugins/koa.js'
import {koaRenderer} from '../renders/koa.js'

export class Router extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    this.config = config    // 配置
    this.executer = null    // 执行器
    this.payloads = []      // 插件
    this.renders = {}       // 渲染器
    this.modules = {}       // 模块
    this.moduleActions = {}     // 模块动作
    this.moduleRoutes = []      // 模块路由
    this.routes = {}            // 模块路由

    this.use(koaPlugin)
    this.use(routePlugin)
    this.use(koaRenderer)
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
      if (!matchContextRoute(ctx, this)) {
        // 404 skip
        if (this.isExecMode) {
          throw new NotRoutedException('Not routed')
        } else {
          return await next()
        }
      }
      // handle
      let exp = false
      try {
        await payload(ctx)
      } catch (err) {
        exp = err
        if (this.isExecMode) {
          throw err
        }
        await this.render(ctx, ctx.renderType, ctx.renderData, err)
      }
      if (!exp) {
        await this.render(ctx, ctx.renderType, ctx.renderData)
      }
      delProps(ctx)
    }
  }
  async exec (ctx) {
    this.executer || (this.executer = this.compose())
    await this.executer(ctx)
    return ctx
  }
  async render (ctx, renderType, renderData, err) {
    let renderer = this.renders[renderType]
    await renderer(ctx, renderData, err)
  }
  get isExecMode () {
    return !!this.executer
  }
  setRender (type, renderer) {
    if (isObject(type)) {
      Object.assign(this.renders, type)
    } else {
      this.renders[type] = renderer
    }
  }
  getRender (type) {
    return this.renders[type]
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
        module,
        middlewares,
        appendMiddleware (name, middleware, prepend) {
          let it = {
            name,
            middleware
          }
          if (prepend) {
            middlewares.unshift(it)
          } else {
            middlewares.push(it)
          }
        },
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

export async function payloadStart (ctx, next) {
  makeSav(ctx, this)
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
  // inject state promise sav etc.
  let foundation = ucfirst(router.config.get('foundation', 'Koa'))
  makeProp(ctx)(Object.assign({
    [`is${foundation}`]: true,
    sav: proxyModuleActions(ctx, router.moduleActions),
    async dispatch (uri) {
      uri = uri.split('.')
      let mod = uri.shift()
      let act = uri.shift()
      await ctx.sav[mod][act]()
    }
  }, promise))
  makeState(ctx)
  makeRender(ctx)
}

function makeState ({prop}) {
  let state = {}
  prop.getter('state', () => state)
  prop({
    setState (...args) {
      let len = args.length
      if (len < 1) {
        return
      } else if (len === 1) {
        if (Array.isArray(args[0])) { // for Promise.all
          args = args[0]
        }
      }
      args.unshift(state)
      Object.assign.apply(state, args)
    },
    replaceState (newState) {
      state = newState || {}
    }
  })
}

function makeRender ({ctx, prop}) {
  prop({
    renderType: 'json',
    renderData: null,
    setRenderType (renderType, data) {
      ctx.renderType = renderType
      if (data !== undefined) {
        ctx.renderData = data
      }
    },
    setJson (data) {
      ctx.setRenderType('json', data)
    },
    setView (data) {
      ctx.setRenderType('view', data)
    },
    setVue (data) {
      ctx.setRenderType('vue', data)
    }
  })
}
