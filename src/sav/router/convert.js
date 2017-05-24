import {isString, convertCase} from '../util'

let modalGroups = ['page', 'layout', 'api']

export function convertRouters (groups) {
  let routes = []
  modalGroups.forEach(groupName => {
    if (groups[groupName]) {
      let group = groups[groupName]
      for (let moduleName in group) {
        routes.push(makeModalRouter(moduleName, group[moduleName], groupName, groups))
      }
    }
  })
  return routes
}

const caseType = 'camel'
const prefix = '/'

function makeModalRouter (moduleName, module, groupName, {uris}) {
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
  uris[moduleRouter.uri].router = moduleRouter
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
    uris[savRoute.uri].router = savRoute
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
