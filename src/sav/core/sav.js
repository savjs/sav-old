import {EventEmitter} from 'events'
import {isObject, isArray, isFunction, makeProp, delProps, next as promiseNext} from 'sav-util'
import {compose} from '../util/compose.js'
import {Config} from './config'
import Debug from 'debug'

const debug = Debug('sav:core')

import {
  statePlugin,
  promisePlugin,
  uriPlugin,
  renderPlugin,
  routerPlugin,
  actionPlugin,
  schemaPlugin,
  authPlugin,
  invokePlugin
} from '../plugins'

export class Sav extends EventEmitter {
  constructor (config) {
    super()
    if (!(config instanceof Config)) {
      config = new Config(config)
    }
    this.config = config    // 配置
    this.executer = null    // 执行器
    this.payloads = []      // 执行中间件
    this.installed = {}     // 已安装插件
    let neat = config.env('neat')
    if (!neat) {
      this.use(statePlugin)
      this.use(promisePlugin)
      this.use(uriPlugin)
      this.use(renderPlugin)
      this.use(routerPlugin)
      this.use(actionPlugin)
      this.use(authPlugin)
      this.use(schemaPlugin)
      this.use(invokePlugin)
    }
  }
  use (plugin) {
    if (isFunction(plugin)) {
      plugin(this)
    } else if (isObject(plugin)) {
      installPlugin(this, plugin)
    } else if (isArray(plugin)) {
      plugin.forEach(this.use)
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
        if (this.isExecMode && (!this.config.env('execNotThrow'))) {
          throw error
        }
        ctx.prop('error', error)
        debug('error', error)
      }
      try {
        await teardown(this, ctx)
      } finally {
        delProps(ctx)
      }
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

let emits = ['prepare', 'setup', 'error']

function installPlugin (sav, plugin) {
  let {name, teardown, payload} = plugin
  emits.forEach((name) => {
    if (plugin[name]) {
      sav.on(name, plugin[name])
    }
  })
  if (teardown) {
    sav.prependListener('teardown', teardown)
  }
  if (payload) {
    sav.payloads.push(payload)
  }
  if (name) {
    debug('install plugin', name)
    sav.installed[name] = plugin
    plugin.installed = true
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
