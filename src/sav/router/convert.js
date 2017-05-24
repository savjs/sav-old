import {isString, convertCase} from '../util'

let groups = ['page', 'layout', 'api']

export function convertRouters (contract) {
  let routes = []
  let uris = {}
  groups.forEach(groupName => {
    if (contract[groupName]) {
      let group = contract[groupName]
      for (let moduleName in group) {
        routes.push(makeModalRouter(group[moduleName], moduleName, groupName, uris))
      }
    }
  })
  return {
    routes,
    uris
  }
}

const caseType = 'camel'
const prefix = '/'

function makeModalRouter (module, moduleName, groupName, uris) {
  let routePrefix = module.prefix || ''
  if (routePrefix.length) {
    routePrefix = normalPath(routePrefix + '/')
  }
  let moduleRouter = {
    uri: `${groupName}.${moduleName}`,
    path: normalPath(prefix + routePrefix + convertPath(module.path, caseType, moduleName)),
    relatives: [],
    absolutes: []
  }
  uris[moduleRouter.uri] = moduleRouter
  for (let routeName in module.routes) {
    let route = module.routes[routeName]
    let path = convertPath(route.path, caseType, routeName)
    let isRelative = path[0] !== '/'
    if (isRelative) { // 相对路由
      path = normalPath(moduleRouter.path + (path ? ('/' + path) : ''))
    }
    let savRoute = {
      uri: `${moduleRouter.uri}.${routeName}`,
      method: route.method || (groupName === 'page' ? 'GET' : 'POST'),
      path
    }
    uris[savRoute.uri] = savRoute
    if (isRelative) {
      moduleRouter.relatives.push(savRoute)
    } else {
      moduleRouter.absolutes.push(savRoute)
    }
  }
  return moduleRouter
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
