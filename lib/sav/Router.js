import {bindEvent, isString, convertCase, prop, pascalCase, Url, Query} from 'sav-util'
import pathToRegexp from 'path-to-regexp'

export class Router {
  constructor (opts) {
    this.opts = {
      prefix: '',
      caseType: 'camel',
      sensitive: true
    }
    bindEvent(this)
    opts && this.setOptions(opts)
    this.modals = {}
    this.actionRoutes = createMethods()
    this.modalRoutes = []
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  declare (routeModals) {
    for (let modalName in routeModals) {
      this.declareModal(modalName, routeModals[modalName])
    }
  }
  declareModal (modalName, modal) {
    this.removeModal(modalName)
    createModalRoute(this, modalName, modal)
  }
  removeModal (modalName) {
    if (this.modals[modalName]) {
      return removeModal(this, modalName)
    }
  }
  matchRoute (path, method) {
    if (method === 'ANY') {
      for (let submethod of methods) {
        let ret = this.matchRoute(path, submethod)
        if (ret) {
          return ret
        }
      }
    }
    if (methods.indexOf(method) === -1) {
      return
    }
    let uri = Url.parse(path)
    path = stripPrefix(uri.path, this.opts.prefix)
    let ret = {
      path
    }
    // 顶级路由
    for (let route of this.actionRoutes[method]) {
      if (matchRoute(route, path, ret)) {
        ret.query = uri.query ? Query.parse(uri.query) : {}
        return ret
      }
    }
    for (let route of this.modalRoutes) {
      // 模块路由
      if (matchRoute(route, path)) {
        for (let subRoute of route.routes[method]) {
          // 子级路由
          if (matchRoute(subRoute, path, ret)) {
            ret.query = uri.query ? Query.parse(uri.query) : {}
            return ret
          }
        }
      }
    }
  }
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

function createMethods () {
  let ret = {}
  methods.forEach((name) => {
    ret[name] = []
  })
  return ret
}

function matchRoute (route, path, ret) {
  let mat = path.match(route.regexp)
  if (mat) {
    if (ret) {
      ret.route = route
      let {keys} = route
      let params = ret.params = {}
      for (let i = 1, len = mat.length; i < len; ++i) {
        const key = keys[i - 1]
        if (key) {
          const val = typeof mat[i] === 'string' ? decodeURIComponent(mat[i]) : mat[i]
          params[key.name] = val
        }
      }
    }
    return true
  }
}

export function stripPrefix (src, prefix) {
  if (prefix) {
    let pos = src.indexOf(prefix)
    if (pos === 0 || ((pos === 1) && src[0] === '/')) {
      src = src.substr(pos + prefix.length, src.length)
      if (src[0] !== '/') {
        src = '/' + src
      }
      return src
    }
  }
  return src
}

function removeModal (router, modalName) {
  let modal = router.modals[modalName]
  delete router.modals[modalName]
  router.modalRoutes = router.modalRoutes.filter((route) => route.modal !== modal)
  let actionRoutes = router.actionRoutes
  methods.forEach((method) => {
    actionRoutes[method] = actionRoutes[method].filter((route) => route.modal !== modal)
  })
  router.emit('removeModal', modal)
  return modal
}

function createModalRoute (router, modalName, modal) {
  let modalRoute = createRoute(router, modalName, modal)
  modalRoute.routes = createMethods()
  router.emit('declareModal', modalRoute)
  for (let actionName in modal.routes) {
    createRoute(router, actionName, modal.routes[actionName], modalRoute)
  }
  router.modals[modalName] = modal
}

function createRoute (router, name, refer, modalRoute) {
  refer.name = name
  let route = {}
  let modal = modalRoute ? modalRoute.modal : refer
  prop(route, 'modal', modal)
  let {caseType, sensitive} = router.opts
  let path = convertPath(refer.path, caseType, name)
  if (!modalRoute) { // modal总是以''开始
    path = normalPath((refer.prefix || '') + '/' + path)
    route.name = pascalCase(name)
    router.modalRoutes.push(route)
  } else { // action
    route.name = modalRoute.name + pascalCase(name)
    let method = route.method = (refer.method || 'GET')
    let isRelative = path[0] !== '/'
    if (isRelative) { // 相对路由
      path = modalRoute.path + '/' + path
    }
    if (isRelative) {
      modalRoute.routes[method].push(route)
    } else {
      router.actionRoutes[method].push(route)
    }
    route.actionName = `${modal.name}.${name}`
    prop(route, 'action', refer)
  }
  route.path = normalPath('/' + path)
  route.keys = []
  route.regexp = pathToRegexp(route.path, route.keys, {
    sensitive,
    end: !!modalRoute
  })
  route.compile = pathToRegexp.compile(route.path, {
    sensitive,
    end: !!modalRoute
  })
  router.emit('declareAction', route)
  return route
}

function convertPath (path, caseType, name) {
  if (!isString(path)) {
    path = convertCase(caseType, name)
  }
  return path
}

function normalPath (path) {
  return path.replace(/\/+/g, '/')
}
