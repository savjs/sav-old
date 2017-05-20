import {convertCase, isString} from '../util'

const caseType = 'camel'
const prefix = '/'

export class SavRoute {
  constructor (module) {
    this.resolveModule(module)
  }
  resolveModule ({props, moduleName}) {
    let moduleRoute = Object.assign({}, props.route)
    let relative = convertPath(moduleRoute.path, caseType, moduleName)
    let routePrefix = props.routePrefix || ''
    if (routePrefix.length) {
      routePrefix = normalPath(routePrefix + '/')
    }
    this.path = normalPath(prefix + routePrefix + relative)
    this.childs = []
    this.parents = []
    this.uris = {}
  }
  resolveRoute (action) {
    if (!action.props.route) {
      return
    }
    let routeData = action.props.route
    let routeProp = routeData.props
    let route = {
      uri: action.uri,
      path: convertPath(routeProp.path, caseType, action.actionName),
      method: routeProp.method
    }
    let path = route.path
    let relative = path || ''
    if (path[0] === '/') { // 相对于根的路由
      path = prefix + (relative = path)
      this.parents.push(route)
    // } else if (path[0] === '~') { // 绝对路由 (暂时先去掉吧)
    //   parents.push(route)
    } else { // 相对于模块的路由,即子路由
      path = this.path + (path ? ('/' + path) : '')
      this.childs.push(route)
    }
    route.relative = relative // for VueRoute
    route.path = normalPath(path)
    this.uris[route.uri] = route
  }
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
