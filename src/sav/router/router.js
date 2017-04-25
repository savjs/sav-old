import {EventEmitter} from 'events'
import compose from 'koa-compose'

import {isArray, isObject, isFunction, makeProp} from '../util'
import {Config} from '../core/config'

export class Router extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    this.config = config    // 配置
    this.executer = null    // 执行器
    this.payloads = []      // 插件
    this.mounts = {}        // 挂载点 如 Api/Article/comment
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
    if (!isArray(modules)) {
      modules = [modules]
    }
    walkModules(this, modules)
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
}

function walkModules (router, modules) {

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
