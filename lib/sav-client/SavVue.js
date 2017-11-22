import {bindEvent, isObject} from 'sav-util'
import {VuePayload} from '../sav/VuePayload.js'

export class SavVue extends VuePayload {
  constructor (opts) {
    super(Object.assign({
      fallback: null, // 请求失败后处理回调
      flux: null,
      sav: null,
      cacheField: true
    }, opts))
    this.savs = {}
    this.caches = {}
    if (this.opts.sav) {
      this.setSav(this.opts.sav)
    }
    bindEvent(this)
    this.opts.router.beforeEach(this.beforeEach.bind(this))
    this.install(opts.Vue)
  }
  setSav (sav) {
    sav.inject(this.opts.flux)
    this.savs[sav.name] = sav
  }
  install (Vue) {
    Vue.filter('field', (value, ns) => {
      ns || (ns = 'sav')
      let sav = this.savs[ns]
      let caches = this.caches
      if (this.opts.cacheField) {
        if (caches[value]) {
          return caches[value]
        }
      }
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
  }
  beforeEach (to, from, next) {
    let payloads = this.getPayloads(to)
    if (payloads.length) {
      let {flux, fallback} = this.opts
      this.invokePayloads(to, payloads).then((newState) => {
        if (newState) {
          flux.updateState(newState).then(() => {
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
    next()
  }
  invokePayloads (vueRoute, payloads) {
    let states = []
    let routes = payloads.filter((it) => {
      if (isObject(it)) {
        let sav = this.savs[it.sav || 'sav']
        if (sav) {
            let data = it.withRoute ? Object.assign({}, vueRoute.params, vueRoute.query) : null
            if (sav.resolvePayload(it, data)) {
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
