// 路由中间件

import {isString, convertCase} from '../util'
import {matchModulesRoute} from '../router/match.js'
import {NotRoutedException} from '../core/exception.js'

export function routerPlugin (sav) {
  sav.use({
    prepare (groups) {
      let routes = convertRouters(groups)
      sav.matchRoute = (ctx) => {
        let method = ctx.method.toUpperCase()
        let path = ctx.path || ctx.originalUrl
        let matched = matchModulesRoute(routes, path, method)
        if (matched) {
          matched = JSON.parse(JSON.stringify(matched))
          let [route, params] = matched
          ctx.route = route
          ctx.params = params
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

export function convertRouters ({uris}) {
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

function createRoute (ref) {
  if (!ref.route) {
    let {name, self, uri, parent} = ref
    let parentRoute = getModalRoute(parent)
    let path = convertPath(self.path, caseType, name)
    let isRelative = path[0] !== '/'
    if (isRelative) { // 相对路由
      path = normalPath(parentRoute.path + (path ? ('/' + path) : ''))
    }
    let savRoute = {
      uri,
      path,
      method: self.method || (parent.parent.name === 'page' ? 'GET' : 'POST')
    }
    if (isRelative) {
      parentRoute.relatives.push(savRoute)
    } else {
      parentRoute.absolutes.push(savRoute)
    }
    ref.route = savRoute
  }
}

function getModalRoute (ref) {
  if (!ref.route) {
    let {name, self, uri} = ref
    let routePrefix = self.prefix || ''
    if (routePrefix.length) {
      routePrefix = normalPath(routePrefix + '/')
    }
    ref.route = {
      uri,
      path: normalPath(prefix + routePrefix + convertPath(self.path, caseType, name)),
      relatives: [],
      absolutes: []
    }
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
