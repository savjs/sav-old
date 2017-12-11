import { bindEvent, isObject, isString } from 'sav-util'
import { VuePayload } from '../sav/VuePayload.js'

export const EVENT_START_PAYLOADS = 'start-process-payloads'
export const EVENT_RESOLVE_PAYLOADS = 'resolve-payloads'
export const EVENT_FINISH_PAYLOADS = 'finish-process-payloads'
export const EVENT_ERROR_PAYLOADS = 'error-process-payloads'

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
    Vue.filter('enumFilter', (value, values) => {
      if (!values) {
        return value
      }
      if (isString(values)) {
        values = values.split()
      }
      return value.filter(it => {
        return values.indexOf(it.value) !== -1
      })
    })
  }

  beforeEach (to, from, next) {
    let payloads = this.getPayloads(to)

    if (payloads.length) {
      let {flux, fallback} = this.opts

      this.emit(EVENT_START_PAYLOADS, {
        id: to.fullPath,
        payloads: payloads.length,
        $route: to
      })

      this.invokePayloads(to, payloads).then((newState) => {
        this.emit(EVENT_FINISH_PAYLOADS, {
          id: to.fullPath,
          $route: to
        })
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
        this.emit(EVENT_ERROR_PAYLOADS, err)
        if (fallback) {
          return fallback(to, from, next, err)
        } else {
          next(err)
        }
      })
      return
    } else {
      this.emit(EVENT_START_PAYLOADS, null)
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

    const e = {
      id: vueRoute.fullPath,
      remains: routes.length
    }

    const _decr = function decreasePayloadsRemains () {
      e.remains = (!e.remains || --e.remains) < 0 ? 0 : e.remains
      this.emit(EVENT_RESOLVE_PAYLOADS, e)
    }

    return Promise.all(routes.map((route) => {
      const p = route.savHandle.invokePayload(route)
      p.then(_decr.bind(this), _decr.bind(this))
      return p
    })).then((args) => {
      args = states.concat(args)
      return args.length ? Object.assign.apply({}, args) : null
    })
  }
}
