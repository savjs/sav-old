import {bindEvent, isFunction, isString, isObject, isArray} from 'sav-util'

export class SavVue {
  constructor (opts) {
    this.opts = {
      deepth: -1, // 组件处理深度
      fallback: null, // 请求失败后处理回调
      Vue: null,
      flux: null,
      router: null,
      sav: null
    }
    this.savs = {}
    Object.assign(this.opts, opts)
    if (this.opts.sav) {
      this.setSav(this.opts.sav)
    }
    bindEvent(this)
    installHook(this)
  }
  setSav (sav) {
    this.savs[sav.name] = sav
    // this.opts.flux.declare()
  }
  fetch (args) {
    let sav = this.savs[args.sav || 'sav']
    return sav.fetch(args)
  }
}

function installHook (savVue) {
  let {router, flux, fallback, deepth, Vue} = savVue.opts
  router.beforeEach((to, from, next) => {
    let matchedComponents = router.getMatchedComponents(to)
    if (matchedComponents.length) {
      let arr = []
      getComponentsDepth(Vue, matchedComponents, deepth, arr)
      let payloads = []
      arr.reduce(processComponent, payloads)
      if (payloads.length) {
        let routes = getRoutes(to, router, payloads, flux)
        Promise.all(routes.map(payload => {
          return savVue.fetch(payload)
        }))
        .then((args) => {
          if (args.length) {
            let newState = Object.assign.apply({}, args)
            flux.updateState(newState)
          }
          next()
        }).catch(err => {
          if (fallback) {
            return fallback(to, from, next, err)
          } else {
            next(false)
          }
        })
        return
      }
    }
    next()
  })
}

function processComponent (payloads, component) {
  let options = typeof component === 'object' ? component : component.options
  if (options.payload) {
    payloads.push(options.payload)
  }
  return payloads
}

function getComponentsDepth (Vue, components, depth, arr) {
  if (isArray(components)) {
    for (let i = 0; i < components.length; ++i) {
      appendComponent(Vue, components[i], depth, arr)
    }
  } else {
    for (let comName in components) {
      appendComponent(Vue, components[comName], depth, arr)
    }
  }
  return arr
}

function appendComponent (Vue, com, depth, arr) {
  if (isString(com)) {
    com = Vue.component(com)
  }
  if (com) {
    arr.push(com)
    if (depth && com.components) {
      getComponentsDepth(Vue, com.components, depth--, arr)
    }
  }
}

function getRoutes (vueRoute, vueRouter, payloads) {
  let routes = payloads.reduce((routes, payload) => {
    if (isFunction(payload)) {
      payload = payload(vueRoute)
    }
    if (isArray(payload) || isObject(payload)) {
      return routes.concat(payload)
    }
    return routes
  }, []).map((route) => {
    if (route.name && !route.fullPath) {
      return vueRouter.resolve(route)
    }
    return route
  })
  return routes
}
