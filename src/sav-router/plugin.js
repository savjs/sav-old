import {convertCase} from './caseconvert.js'
import {matchRouter} from './matchs.js'

const CASE_TYPE = 'case'
const ROUTE_PREFIX = 'prefix'

function convertPath (path, caseType, name) {
  if (typeof path !== 'string') {
    if (caseType) {
      path = convertCase(caseType, name)
    } else {
      path = name
    }
  }
  return path
}

export function routerPlugin (ctx) {
  let prefix = ctx.config(ROUTE_PREFIX) || '/'
  let caseType = ctx.config(CASE_TYPE)
  let routers = []
  let moduleMap = {}
  ctx.matchRoute = (pathname, method) => {
    let match = matchRouter(routers, pathname, method)
    if (match && !match[1]) {
      return matchRouter(match[0].childs, pathname, method)
    }
    return match
  }
  ctx.use({
    module (module, {ctx}) {
      let {name, props: {route}} = module
      route = {...route}
      route.relative = convertPath(route.path, caseType, name)
      route.path = prefix + route.relative
      route.childs = []
      routers.push(route)
      moduleMap[name] = route
      module.route = {route, children: []}
    },
    middleware ({name, args}, {ctx, module, action, middlewares}) {
      if (name !== 'route') {
        return
      }
      let route = {
        path: convertPath(args[1], caseType, action.name),
        methods: args[0] || [],
        middlewares: middlewares
      }
      route.relative = route.path || ''

      let path = route.path
      if (path[0] === '/') { // absolute
        routers.push(route)
      } else if (path[0] === '~') { // relative to root
        route.path = prefix + (route.relative = path.substr(1, path.length))
        routers.push(route)
      } else {
        let moduleRoute = moduleMap[module.name]
        route.path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
        moduleRoute.childs.push(route)
      }
      module.route.children.push(route)
      middlewares.push(async (ctx) => {
        await action.method(ctx)
      })
    }
  })
}
