// 路由中间件
import pathToRegexp from 'path-to-regexp'
import {isString, convertCase, prop} from 'sav-util'
import {NotRoutedException} from '../core/exception.js'

export function routerPlugin (sav) {
  sav.use({
    name: 'router',
    prepare (groups) {
      let routes = normalizeRoutes(groups)
      sav.matchRoute = (ctx) => {
        let method = ctx.method.toUpperCase()
        let path = ctx.path || ctx.originalUrl
        let matched = matchModulesRoute(routes, path, method)
        if (matched) {
          matched = JSON.parse(JSON.stringify(matched))
          let [route, params] = matched
          ctx.route = route
          ctx.params = params
          ctx.router = groups.uris[route.uri]
        }
        return matched
      }
    },
    setup (ctx) {
      let exp
      try {
        exp = !sav.matchRoute(ctx)
      } catch (err) {
        throw new NotRoutedException(err)
      }
      if (exp) {
        throw new NotRoutedException('NotRouted')
      }
    }
  })
}

export function normalizeRoutes ({uris}) {
  let routes = []
  for (let uri in uris) {
    let ret = uris[uri]
    if (ret.isModal) {
      routes.push(getModalRoute(ret))
    } else if (ret.isRoute) {
      createRoute(ret)
    }
  }
  return routes
}

const caseType = 'camel'
const prefix = '/'

function getDefaultMethod (modalGroup) {
  return modalGroup === 'api' ? 'POST' : 'GET'
}

function createRoute (ref) {
  if (!ref.route) {
    let {name, props, uri, parent} = ref
    let parentRoute = getModalRoute(parent)
    let path = convertPath(props.path, caseType, name)
    let isRelative = path[0] !== '/'
    if (isRelative) { // 相对路由
      path = normalPath(parentRoute.path + (path ? ('/' + path) : ''))
    }
    let savRoute = {
      uri,
      path,
      method: props.method || getDefaultMethod(parent.parent.name)
    }
    if (isRelative) {
      parentRoute.relatives.push(savRoute)
    } else {
      parentRoute.absolutes.push(savRoute)
    }
    prop(savRoute, 'regexp', pathToRegexp.compile(path))
    prop(ref, 'route', savRoute)
  }
}

function getModalRoute (ref) {
  if (!ref.route) {
    let {name, props, uri} = ref
    let routePrefix = props.prefix || ''
    if (routePrefix.length) {
      routePrefix = normalPath(routePrefix + '/')
    }
    let route = {
      uri,
      path: normalPath(prefix + routePrefix + convertPath(props.path, caseType, name)),
      relatives: [],
      absolutes: []
    }
    prop(ref, 'route', route)
  }
  return ref.route
}

function convertPath (path, caseType, name) {
  if (!isString(path)) {
    path = convertCase(caseType, name)
  }
  return path
}

function normalPath (path) {
  return path.replace(/\/\//g, '/')
}

export function matchModulesRoute (moduleRoutes, path, method) {
  let ret
  for (let moduleRoute of moduleRoutes) {
    if (moduleRoute.absolutes.length) {
      ret = matchRouter(moduleRoute.absolutes, path, method)
      if (ret) {
        return ret
      }
    }
  }
  let mats = []
  matchRouter(moduleRoutes, path, method, mats)
  let len = mats.length
  if (len === 1) {
    return matchRouter(mats[0].relatives, path, method)
  } else if (len > 1) {
    return mats.reduce((src, it) => {
      return src || matchRouter(it.relatives, path, method)
    }, null)
  }
}

export function matchRouter (routers, path, method, mats) {
  let len = routers.length
  let step = 0
  let params = {}
  let route
  let isModule
  while (step < len) {
    route = routers[step++]
    isModule = !!route.relatives
    if (matchRoute(route.path, params, path, {end: !isModule, sensitive: true})) {
      if (isModule) {
        if (mats) {
          mats.push(route)
        } else {
          return [route]
        }
      }
      if (route.method === method) {
        return [route, params]
      }
    }
  }
}

let regexpCache = []

export function matchRoute (path, params, pathname, opts = {}) {
  let keys, regexp
  let key = `${opts.end}-${opts.sensitive}-${path}`// unique
  const hit = regexpCache[key]
  if (hit) {
    keys = hit.keys
    regexp = hit.regexp
  } else {
    keys = []
    regexp = pathToRegexp(path, keys, opts)
    regexpCache[key] = {keys, regexp}
  }
  const m = pathname.match(regexp)
  if (!m) {
    return false
  }
  if (params) {
    for (let i = 1, len = m.length; i < len; ++i) {
      const key = keys[i - 1]
      if (key) {
        const val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i]
        params[key.name] = val
      }
    }
  }
  return true
}
