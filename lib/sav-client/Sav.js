import {SavBase} from '../sav/SavBase.js'
import {Request} from './Request.js'
import {prop, pascalCase} from 'sav-util'
import {crc32} from './crc32.js'

export class Sav extends SavBase {
  init () {
    this.request = new Request(this)
    this.caches = {}
  }
  inject (flux) {
    let isSav = this.name === 'sav'
    let {schema} = this
    let actions = Object.keys(this.routes).reduce((ret, route) => {
      route = this.routes[route]
      let actionName = pascalCase(route.method.toLowerCase() + '_' + (isSav ? '' : this.name) + route.name)
      ret[actionName] = (flux, data, fetch) => {
        let argv = Object.assign({}, data)
        return this.invoke(flux, argv, route, fetch)
      }
      if (route.keys.length === 0) {
        ret[`${actionName}Data`] = (flux, data, fetch) => {
          let argv = {data}
          return this.invoke(flux, argv, route, fetch)
        }
      }
      let reqStruct = schema.getSchema(route.request)
      if (reqStruct) {
        let reqName = (isSav ? '' : this.name) + route.request
        ret[`Check${reqName}`] = (flux, data) => {
          return reqStruct.check(data)
        }
        ret[`Extract${reqName}`] = (flux, data) => {
          return reqStruct.extractThen(data)
        }
      }
      let resStruct = schema.getSchema(route.response)
      if (resStruct) {
        let resName = (isSav ? '' : this.name) + route.response
        ret[`Check${resName}`] = (flux, data) => {
          return resStruct.check(data)
        }
        ret[`Extract${resName}`] = (flux, data) => {
          return resStruct.extractThen(data)
        }
      }
      return ret
    }, {})
    flux.declare({
      actions
    })
  }
  invoke (flux, argv, route, fetch) {
    prop(argv, 'route', route)
    return this.invokePayload(argv).then(async data => {
      if (fetch) {
        return data || argv.output
      }
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
          argv.input = reqStruct.extract(argv.input)
        } catch (err) {
          err.status = 400
          throw err
        }
      }
      argv.method = route.method
      let output = await this.fetch(argv)
      let resStruct = schema.getSchema(route.response)
      let cache
      if (resStruct) {
        resStruct.check(output)
        cache = resStruct.opts.cache
        if (cache) {
          this.removeCache(cache)
        }
      }
      argv.output = output
      if (cacheKey) {
        this.setCache(cacheKey, ttl, cache || route.response, output)
      }
    } else {
      argv.output = cacheVal
    }
    return this.mapPayloadState(argv)
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
    return this.request.request(argv)
  }
  getCacheKey (argv) {
    // 只支持query
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
  setCache (key, ttl, name, value) {
    this.caches[key] = {
      now: +new Date(),
      ttl,
      name,
      value: JSON.stringify(value)
    }
  }
  removeCache (name) {
    let it
    for (let cacheKey in this.caches) {
      it = this.caches[cacheKey]
      if (it.name === name) {
        delete this.caches[cacheKey]
      }
    }
  }
}
