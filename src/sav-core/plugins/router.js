import {convertCase} from '../utils/convert.js'
import {matchRouter} from '../utils/matchs.js'

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
    module (module) {
      let {moduleName, props: {route}} = module
      route = {...route}
      route.relative = convertPath(route.path, caseType, moduleName)
      route.path = prefix + route.relative
      route.childs = []
      routers.push(route)
      moduleMap[moduleName] = route
      module.route = {route, children: []}
    },
    action (action) {
      if (!action.props.route) {
        return
      }
      let args = action.props.route
      let module = action.module
      let route = {
        path: convertPath(args[1], caseType, action.actionName),
        methods: args[0] || [],
        get middlewares () {
          return action.middlewares
        }
      }
      route.relative = route.path || ''

      let path = route.path
      if (path[0] === '/') { // absolute
        routers.push(route)
      } else if (path[0] === '~') { // relative to root
        route.path = prefix + (route.relative = path.substr(1, path.length))
        routers.push(route)
      } else {
        let moduleRoute = moduleMap[module.moduleName]
        route.path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
        moduleRoute.childs.push(route)
      }
      module.route.children.push(route)
      action.set('route', async (ctx) => {
        await action.method(ctx)
      })
    }
  })
}
