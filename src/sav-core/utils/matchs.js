import pathToRegexp from 'path-to-regexp'

/**
  @typedef  {Object} Route
  @property {String} path         url expr
  @property {Array}  methods      http methods
  @property {Array}  childs       the module's sub Route (ModuleRoute only)
 */

/**
 * math routes
 * @param  {Array} routers  array of routers to match
 * @param  {String} path    the path of url
 * @param  {String} method  the method of http request
 * @return {Array}          the matched route [route] or [route, params]
 */

export function matchRouter (routers, path, method) {
  let len = routers.length
  let step = 0
  let params = {}
  let route
  let isModule
  while (step < len) {
    route = routers[step++]
    isModule = !!route.childs
    if (matchRoute(route.path, params, path, {end: !isModule, sensitive: true})) {
      if (isModule) {
        return [route]
      }
      if (route.methods.indexOf(method) !== -1) {
        return [route, params]
      }
    }
  }
}

let regexpCache = []

export function matchRoute (path, params, pathname, opts) {
  let keys, regexp
  const hit = regexpCache[path]
  if (hit) {
    keys = hit.keys
    regexp = hit.regexp
  } else {
    keys = []
    regexp = pathToRegexp(path, keys, opts)
    regexpCache[path] = { keys, regexp }
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
