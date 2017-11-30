import {bindEvent, isObject} from 'sav-util'
import {VuePayload} from '../sav/VuePayload.js'

export class SavVue extends VuePayload {
  constructor (opts) {
    super(Object.assign({
      fallback: null, // 请求失败后处理回调
      flux: null,
      sav: null,
      cacheField: true,
      cacheEnum: true
    }, opts))
    this.savs = {}
    this.caches = {}
    if (this.opts.sav) {
      this.setSav(this.opts.sav)
    }
    bindEvent(this)
    this.opts.router.beforeEach(this.beforeEach.bind(this))
    this.installVue(opts.Vue)
    this.initFlux(opts.flux)
  }
  setSav (sav) {
    sav.inject(this.opts.flux)
    this.savs[sav.name] = sav
  }
  initFlux (flux) {
    let self = this
    flux.declare({
      actions: {
        RemoveCache (flux, key) {
          let [savName, cacheKey] = key.split('.')
          if (!cacheKey) {
            cacheKey = savName
            savName = 'sav'
          }
          self.savs[savName].removeCache(cacheKey)
        }
      }
    })
  }
  installVue (Vue) {
    // {{ 'ResAccountLogin.username' | field }}
    Vue.filter('field', (value, ns) => {
      ns || (ns = 'sav')
      let caches = this.caches
      if (this.opts.cacheField) {
        if (caches[value]) {
          return caches[value]
        }
      }
      let sav = this.savs[ns]
      let [structName, fieldName] = value.split('.')
      let ret
      try {
        let struct = sav.schema.getSchema(structName)
        let field = struct.opts.props[fieldName]
        ret = field.text || `${ns}.${value}`
      } catch (err) {
        ret = `${ns}.${value}`
      } finally {
        if (this.opts.cacheField) {
          caches[value] = ret
        }
      }
      return ret
    })
    // {{'GroupRoleEnum.master' | enumText }}
    // {{ 'master' | enumText('GroupRoleEnum') }}
    Vue.filter('enumText', (value, enumName, ns) => {
      ns || (ns = 'sav')
      if (!enumName) {
        let arr = value.split('.')
        value = arr[1]
        enumName = arr[0]
      }
      let uri = `${ns}.${enumName}.${value}`
      let caches = this.caches
      if (this.opts.cacheEnum) {
        if (caches[uri]) {
          return caches[uri]
        }
      }
      let sav = this.savs[ns]
      let ret
      try {
        let schemaEnum = sav.schema.getSchema(enumName)
        ret = schemaEnum.key(value)
      } catch (err) {
        ret = uri
      } finally {
        if (this.opts.cacheEnum) {
          caches[uri] = ret
        }
      }
      return ret
    })
  }
  beforeEach (to, from, next) {
    let payloads = this.getPayloads(to)
    if (payloads.length) {
      let {flux, fallback} = this.opts
      this.invokePayloads(to, payloads).then((newState) => {
        if (newState) {
          flux.updateState(newState).then(() => {
            if (to.meta.title) {
              document.title = to.meta.title
            }
            next()
          })
          return
        }
        next()
      }).catch(err => {
        if (fallback) {
          return fallback(to, from, next, err)
        } else {
          next(err)
        }
      })
      return
    }
    if (to.meta.title) {
      document.title = to.meta.title
    }
    next()
  }
  invokePayloads (vueRoute, payloads) {
    let states = []
    let routes = payloads.filter((it) => {
      if (isObject(it)) {
        let sav = this.savs[it.sav || 'sav']
        if (sav) {
          if (sav.resolvePayload(it, vueRoute)) {
            if (it.state) {
              states.push(it.state)
            } else {
              return true
            }
          }
        }
      }
    })
    return Promise.all(routes.map((route) => route.savHandle.invokePayload(route)))
      .then((args) => {
        args = states.concat(args)
        return args.length ? Object.assign.apply({}, args) : null
      })
  }
}
