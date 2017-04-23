import {EventEmitter} from 'events'
import {isArray, isObject, isFunction, makeProp} from '@sav/util'
import {payloadStart, payloadEnd, walkModules} from './walker'
import {Config} from './config'
import {routePlugin} from './route'
import compose from 'koa-compose'

export class Router extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    makeProp(this)({
      config,
      payloads: [],
      executer: null
    })
    this.routers = []
    this.modules = {}
    this.groups = {} // 模块分组
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
  }
  declare (modules) {
    if (!isArray(modules)) {
      modules = [modules]
    }
    walkModules(this, modules)
  }
  route () {
    let payloads = [payloadStart.bind(this)].concat(this.payloads).concat([payloadEnd.bind(this)])
    let payload = compose(payloads)
    return payload
  }
  async exec (ctx) {
    if (this.executer) {
      return await this.executer(ctx)
    }
    this.executer = this.route()
    return await this.executer(ctx)
  }
}
