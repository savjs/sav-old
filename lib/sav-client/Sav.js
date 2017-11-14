import {SavBase} from '../sav/SavBase.js'
import {Request} from './Request.js'
import {prop, isArray, isObject, isFunction} from 'sav-util'
import {crc32} from './crc32.js'

export class Sav extends SavBase {
  init () {
    this.request = new Request(this)
    this.caches = {}
  }
  inject (flux) {
    let isSav = this.name === 'sav'
    flux.declare({
      actions: Object.keys(this.actions).reduce((ret, action) => {
        action = this.actions[action]
        let actionName = action.method.toLowerCase() + (isSav ? '' : this.name) + action.name
        ret[actionName] = (flux, argv) => {
          return this.invoke(flux, argv || {}, action)
        }
        return ret
      }, {})
    })
  }
  invoke (flux, argv, action) {
    prop(argv, 'action', action)
    return this.invokePayload(argv).then(async data => {
      await flux.updateState(data)
    })
  }
  async invokePayload (argv) {
    let {schema} = this
    let {action} = argv
    argv.url = action.compile(argv.params)
    argv.input = Object.assign({}, argv.params, argv.query, argv.data)
    let ttl = this.opts.noCache ? null : argv.ttl || (argv.action.ttl)
    let cacheKey = ttl ? this.getCacheKey(argv) : null
    let cacheVal = cacheKey ? this.getCache(cacheKey, ttl) : null
    if (!cacheVal) {
      let reqStruct = schema.getSchema(action.request)
      if (reqStruct) {
        try {
          reqStruct.check(argv.input)
        } catch (err) {
          err.status = 400
          throw err
        }
      }
      let output = await this.fetch(argv)
      let resStruct = schema.getSchema(action.response)
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
    // @TODO 使用mock数据或mockServer获取
    return this.request.request(argv)
  }
  mapState (argv) {
    let {action} = argv
    let {modalAction} = this
    let invoker = modalAction.getAction(action.actionName)
    let output = argv.output
    if (invoker) {
      output = invoker(argv)
    }
    let ret
    if (isObject(output)) {
      ret = mapping(argv, output) || mapping(argv.action, output) || output
    }
    return ret
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

function mapping (target, output) {
  let {mapState} = target
  if (isArray(mapState)) {
    return mapState.reduce((ret, name) => {
      ret[name] = getStatePath(output, name)
    }, {})
  } else if (isObject(mapState)) {
    let ret = {}
    for (let name in mapState) {
      ret[name] = getStatePath(output, mapState[name])
    }
    return ret
  } else if (isFunction(mapState)) {
    return mapState(output)
  }
}

function getStatePath (output, stateName) {
  let pos = stateName.indexOf('.')
  while (pos !== -1) {
    output = output[stateName.substring(0, pos)]
    if (!isObject(output)) {
      return
    }
    stateName = stateName.substr(pos + 1)
    pos = stateName.indexOf('.')
  }
  return output[stateName]
}
