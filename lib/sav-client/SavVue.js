import {bindEvent, isFunction, isObject} from 'sav-util'
import {VuePayload} from '../sav/VuePayload.js'

export class SavVue extends VuePayload {
  constructor (opts) {
    super(Object.assign({
      fallback: null, // 请求失败后处理回调
      flux: null,
      sav: null
    }, opts))
    this.savs = {}
    if (this.opts.sav) {
      this.setSav(this.opts.sav)
    }
    bindEvent(this)
    this.opts.router.beforeEach(this.beforeEach.bind(this))
  }
  setSav (sav) {
    sav.inject(this.opts.flux)
    this.savs[sav.name] = sav
  }
  beforeEach (to, from, next) {
    let payloads = this.getPayloads(to)
    if (payloads.length) {
      let {flux, fallback} = this.opts
      this.invokePayloads(to, payloads).then((args) => {
        if (args.length) {
          let newState = Object.assign.apply({}, args)
          flux.updateState(newState)
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
    let routes = payloads.reduce((routes, payload) => {
      if (isFunction(payload)) {
        payload = payload(vueRoute)
      }
      if (Array.isArray(payload) || isObject(payload)) {
        return routes.concat(payload)
      }
      return routes
    }, []).filter((it) => {
      if (isObject(it)) {
        if (it.savHandle) {
          return true
        }
        let sav = this.savs[it.sav || 'sav']
        if (sav) {
          return sav.resolve(it)
        }
      }
    })
    return Promise.all(routes.map((route) => route.savHandle.invokePayload(route)))
      .then((args) => {
        return args.length ? Object.assign.apply({}, args) : {}
      })
  }
}
