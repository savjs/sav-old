import {bindEvent, isObject} from 'sav-util'
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
          if (sav.resolvePayload(it)) {
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
