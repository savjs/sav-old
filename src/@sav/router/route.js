import {convertCase, shortId, prop} from '@sav/util'
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

export function routePlugin (ctx) {
  let {config} = ctx
  let prefix   = config.get(ROUTE_PREFIX, '/')
  let caseType = config.get(CASE_TYPE, 'camel')
  let routers = ctx.routers
  let moduleMap = ctx.modules
  ctx.matchRoute = (pathname, method) => {
    let match = matchRouter(routers, pathname, method)
    if (match && !match[1]) {
      return matchRouter(match[0].childs, pathname, method)
    }
    return match
  }
  ctx.use({
    module (module) {
      let {moduleName, route} = module
      module.id || module.prop('id', moduleName + (module.moduleGroup || ('-' + shortId())))
      route = {...route}
      route.name = convertCase('pascal', moduleName)
      route.relative = convertPath(route.path, caseType, moduleName)
      route.path = prefix + route.relative
      route.childs = []
      routers.push(route)
      module.route = route
      moduleMap[module.id] = module
    },
    action (action) {
      if (!action.hasMiddleware('route')) {
        return
      }
      let args = action.props.route
      let route = {
        name: convertCase('pascal', action.actionName),
        path: convertPath(args.path, caseType, action.actionName),
        methods: args.methods || []
      }
      prop(route, 'action', action)
      route.relative = route.path || ''
      let path = route.path
      if (path[0] === '/') { // absolute
        routers.unshift(route)
      } else if (path[0] === '~') { // relative to root
        route.path = prefix + (route.relative = path.substr(1, path.length))
        routers.unshift(route)
      } else {
        let moduleRoute = moduleMap[action.module.id].route
        let path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
        route.path = path.replace(/\/\//g, '/')
        moduleRoute.childs.push(route)
      }
      action.route = route
      action.setMiddleware('route', action.method)
    }
  })
}
