import {EventEmitter} from 'events'
import {compose, isObject, isFunction} from '../util'
import {Config} from './config'

import {propsPlugin, routerPlugin, actionPlugin} from '../plugins'

export class Sav extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    this.config = config    // 配置
    this.executer = null    // 执行器
    this.payloads = []      // 插件
    let neat = config.env('neat')
    if (!neat) {
      this.use(routerPlugin)
      this.use(propsPlugin)
      this.use(actionPlugin)
    }
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
  async prepare (data) {
    let promise = Promise.resolve()
    this.emit('prepare', data, promise)
    return promise.catch((err) => {
      this.emit('error', err)
    })
  }
  compose () {
    let payload = compose([async (ctx, next) => {
      await next()
    }].concat(this.payloads))
    return async (ctx, next) => {
      let error
      try {
        await setup(this, {ctx})
        await payload(ctx)
      } catch (err) {
        error = err
        if (this.isExecMode) {
          throw error
        }
      }
      await shutdown(this, {ctx, error})
    }
  }
  async exec (ctx) {
    this.executer || (this.executer = this.compose())
    await this.executer(ctx)
    return ctx
  }
  get isExecMode () {
    return !!this.executer
  }
}

async function setup (sav, target) {
  let promise = Promise.resolve()
  sav.emit('setup', target, promise)
  return promise
}

async function shutdown (sav, target) {
  let promise = Promise.resolve()
  sav.emit('shutdown', target, promise)
  return promise.catch((err) => {
    sav.emit('error', err)
  })
}
