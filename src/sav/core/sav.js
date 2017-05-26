import {EventEmitter} from 'events'
import {compose, isObject, isFunction, makeProp} from '../util'
import {Config} from './config'

import {
  propsPlugin,
  statePlugin,
  promisePlugin,
  uriPlugin,
  renderPlugin,
  routerPlugin,
  actionPlugin,
  schemaPlugin,
  authPlugin
} from '../plugins'

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
      this.use(propsPlugin)
      this.use(statePlugin)
      this.use(promisePlugin)
      this.use(uriPlugin)
      this.use(renderPlugin)
      this.use(routerPlugin)
      this.use(actionPlugin)
      this.use(schemaPlugin)
      this.use(authPlugin)
    }
  }
  use (plugin) {
    if (isFunction(plugin)) {
      plugin(this)
    } else if (isObject(plugin)) {
      for (let name in plugin) {
        if (name === 'payload') {
          this.payloads.push(plugin[name])
        } else if (name === 'teardown') {
          this.prependListener(name, plugin[name])
        } else {
          this.on(name, plugin[name])
        }
      }
    }
    return this
  }
  prepare (data) {
    let next = promiseNext()
    try {
      this.emit('prepare', data, next)
    } catch (err) {
      next(() => { throw err })
    }
    return next()
  }
  compose () {
    let payload = compose([async (ctx, next) => {
      await next()
    }].concat(this.payloads))
    return async (ctx, next) => {
      try {
        makeProp(ctx)
        await setup(this, ctx)
        await payload(ctx)
      } catch (error) {
        if (this.isExecMode) {
          throw error
        }
        ctx.prop('error', error)
      }
      await teardown(this, ctx)
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

function setup (sav, target) {
  let next = promiseNext()
  try {
    sav.emit('setup', target, next)
  } catch (err) {
    next(() => { throw err })
  }
  return next()
}

function teardown (sav, target) {
  let next = promiseNext()
  try {
    sav.emit('teardown', target, next)
  } catch (err) {
    next(() => { throw err })
  }
  return next().catch((err) => {
    sav.emit('error', err)
  })
}

function promiseNext () {
  let promise = Promise.resolve()
  let ret = (resolve, reject) => {
    if (resolve || reject) {
      promise = promise.then(resolve, reject)
    }
    return promise
  }
  return ret
}
