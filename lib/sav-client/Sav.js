import {SavBase} from '../sav/SavBase.js'
import {Request} from './Request.js'
import {prop} from 'sav-util'
import {crc32} from './crc32.js'

export class Sav extends SavBase {
  init () {
    this.request = new Request(this)
    this.caches = {}
  }
  inject (flux) {
    let isSav = this.name === 'sav'
    flux.declare({
      actions: Object.keys(this.routes).reduce((ret, route) => {
        route = this.routes[route]
        let actionName = route.method.toLowerCase() + (isSav ? '' : this.name) + route.name
        ret[actionName] = (flux, argv) => {
          return this.invoke(flux, argv || {}, route)
        }
        return ret
      }, {})
    })
  }
  invoke (flux, argv, route) {
    prop(argv, 'route', route)
    return this.invokePayload(argv).then(async data => {
      if (data) {
        await flux.updateState(data)
      }
    })
  }
  async invokePayload (argv) {
    let {schema} = this
    let {route} = argv
    argv.url = route.compile(argv.params)
    argv.input = Object.assign({}, argv.params, argv.query, argv.data)
    let ttl = this.opts.noCache ? null : argv.ttl || (route.action.ttl)
    let cacheKey = ttl ? this.getCacheKey(argv) : null
    let cacheVal = cacheKey ? this.getCache(cacheKey, ttl) : null
    if (!cacheVal) {
      let reqStruct = schema.getSchema(route.request)
      if (reqStruct) {
        try {
          reqStruct.check(argv.input)
        } catch (err) {
          err.status = 400
          throw err
        }
      }
      let output = await this.fetch(argv)
      let resStruct = schema.getSchema(route.response)
      if (resStruct) {
        resStruct.check(output)
      }
      argv.output = output
      if (cacheKey) {
        this.setCache(cacheKey, ttl, output)
      }
    } else {
      argv.output = cacheVal
    }
    return this.mapState(argv)
  }
  fetch (argv) {
    if (this.opts.mockState) {
      let mocks = this.mocks[argv.route.response]
      if (mocks && mocks.length) {
        if (this.opts.mockFlow) {
          return new Promise((resolve, reject) => {
            this.emit('mockFlow', {resolve, reject, argv, mocks})
          })
        } else {
          return mocks[0].data
        }
      } else {
        throw new Error(`mock data no found: ${argv.route.response}`)
      }
    }
    // @TODO 使用mock数据或mockServer获取
    return this.request.request(argv)
  }
  getCacheKey (argv) {
    let uri = argv.url + JSON.stringify(argv.query)
    return crc32(uri)
  }
  getCache (key, ttl) {
    let val = this.caches[key]
    if (val) {
      if (ttl < 0) {
        return JSON.parse(val.value)
      }
      let now = +new Date()
      if (now < val.now + ttl * 1000) {
        return JSON.parse(val.value)
      }
      delete this.caches[key]
    }
  }
  setCache (key, ttl, value) {
    this.caches[key] = {
      now: +new Date(),
      ttl,
      value: JSON.stringify(value)
    }
  }
}
