import {EventEmitter} from 'events'
import compose from 'koa-compose'

import {isArray, isObject, isFunction, makeProp} from '../util'
import {Config} from '../core/config'
import {convertRoute} from './convert.js'
import {matchModulesRoute} from './matchs.js'

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
    return payload
  }
  async exec (ctx) {
    if (this.executer) {
      return await this.executer(ctx)
    }
    this.executer = this.compose()
    return await this.executer(ctx)
  }
  matchRoute (path, method) {
    return matchModulesRoute(this.moduleRoutes, path, method)
  }
}

let moduleTypes = ['Layout', 'Api', 'Page']

function walkModules (router, modules) {
  let {config} = router
  for (let module of modules) {
    let {uri, moduleGroup} = module
    if (moduleTypes.indexOf(moduleGroup) > 0) { // Api 或 Page 类型的需要路由
      // 路由部分可以提前生成, 减少加载编译时间
      if (!module.SavRoute) { // 注入 SavRoute 和 VueRoute
        let routeInfo = convertRoute(module,
          config.get('caseType', 'camel'),
          config.env('prefix', '/'))
        Object.assign(module, routeInfo)
      }
    }
    if (module.SavRoute) { // 服务端路由处理
      router.moduleRoutes.push(module.SavRoute)
    }
    if (module.actions) { // 模块方法表
      router.moduleActions[uri] = module.actions
    }
    router.modules[uri] = module
    router.emit('module', module)
    for (let action of module.routes) {
      router.emit('action', action)
    }
  }
}

export async function payloadStart (ctx, next) {
  makeProp(ctx)
  await next()
}

export async function payloadEnd (ctx, next) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let matched = this.matchRoute(path, method)
  if (matched) {
    let [route, params] = matched
    let action = route.action
    ctx.prop({params, route, action})
    // 路由中间件
    await executeMiddlewares(action.middlewares)
    // @TODO 渲染
  } else {
    await next()
  }
}

function executeMiddlewares (router, middlewares) {

}
