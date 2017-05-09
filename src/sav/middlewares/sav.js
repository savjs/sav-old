import {convertCase, isString} from '../util'

/*
  "SavRoute": {
    "uri": "AccountPage",
    "path": "/account",
    "childs": [
      {
        "uri": "AccountPage.login",
        "path": "/account/login",
        "relative" : "login",
        "methods": [
          "GET"
        ]
      }
    ],
    "parents": []
  },
 */

export function makeSavRoute (module) {
  let caseType = 'camel'
  let prefix = '/'
  let {props, moduleName} = module

  let moduleRoute = Object.assign({uri: module.uri}, props.route)
  let relative = convertPath(moduleRoute.path, caseType, moduleName)
  let routePrefix = props.routePrefix || ''
  if (routePrefix.length) {
    routePrefix = normalPath(routePrefix + '/')
  }
  moduleRoute.path = normalPath(prefix + routePrefix + relative)
  let childs = moduleRoute.childs = []
  let parents = moduleRoute.parents = []

  for (let action of module.routes) {
    if (action.props.route) {
      let routeData = action.props.route
      let routeProp = routeData.props
      let route = {
        uri: action.uri,
        path: convertPath(routeProp.path, caseType, action.actionName),
        methods: routeProp.methods || []
      }
      let path = route.path
      relative = path || ''
      if (path[0] === '/') { // 相对于根的路由
        path = prefix + (relative = path)
        parents.push(route)
      // } else if (path[0] === '~') { // 绝对路由 (暂时先去掉吧)
      //   parents.push(route)
      } else { // 相对于模块的路由,即子路由
        path = moduleRoute.path + (path ? ('/' + path) : '')
        childs.push(route)
      }
      route.relative = relative // for VueRoute
      route.path = normalPath(path)
    }
  }
  module.SavRoute = moduleRoute
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
