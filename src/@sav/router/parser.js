import {convertCase, isString} from '@sav/util'

export function parseRoutes (module, opts) {
  opts || (opts = defaultOpts)
  let {moduleName} = module
  // 解析模块路由
  let moduleRoute = Object.assign({moduleName}, module.route)
  moduleRoute.relative = convertPath(moduleRoute.path, opts.caseType, moduleName)
  moduleRoute.path = opts.prefix + moduleRoute.relative
  let childs = []
  let ups = []
  // 解析子路由
  for (let action of module.routes) {
    if (~action.plugins.indexOf('route')) {
      let {actionName} = action
      let args = action.props.route
      let route = {
        moduleName,
        actionName,
        path: convertPath(args.path, opts.caseType, actionName),
        methods: args.methods || []
      }
      route.relative = route.path || ''
      let path = route.path
      if (path[0] === '/') { // 绝对路由
        ups.push(route)
      } else if (path[0] === '~') { // 相对于根的路由
        route.path = opts.prefix + (route.relative = path.substr(1, path.length))
        ups.push(route)
      } else { // 相对于模块的路由,即子路由
        let path = moduleRoute.path + (route.path ? ('/' + route.path) : '')
        route.path = path.replace(/\/\//g, '/')
        delete route.moduleName
        childs.push(route)
      }
    }
  }
  return {
    route: moduleRoute,
    childs,
    ups
  }
}

function convertPath (path, caseType, name) {
  if (!isString(path)) {
    path = convertCase(caseType, name)
    console.log(caseType, name, path)
  }
  return path
}

const defaultOpts = {
  caseType: 'camel',
  prefix: '/'
}
