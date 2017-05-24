import pathToRegexp from 'path-to-regexp'

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
