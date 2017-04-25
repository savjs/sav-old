import {convertCase, isString} from '@sav/util'

export function convertRoute (module, caseType = 'camel', prefix = '/') {
  let {moduleName} = module
  // 解析模块路由
  let moduleRoute = Object.assign({uri: module.uri}, module.route)
  let relative = convertPath(moduleRoute.path, caseType, moduleName)
  moduleRoute.path = prefix + relative
  let childs = []
  let root = []

  let isVue = module.view === 'vue'
  let vueCase = 'pascal'
  let vueModule
  if (isVue) {
    vueModule = {
      component: convertCase(vueCase, `${moduleName}/${moduleName}`),
      path: moduleRoute.path,
      children: []
    }
  }

  // 解析子路由
  for (let action of module.routes) {
    if (~action.plugins.indexOf('route')) {
      let {actionName} = action
      let args = action.props.route
      let route = {
        uri: action.uri,
        path: convertPath(args.path, caseType, actionName),
        methods: args.methods || []
      }
      let path = route.path
      relative = path || ''
      if (path[0] === '/') { // 相对于根的路由
        path = prefix + (relative = path)
        root.push(route)
      // } else if (path[0] === '~') { // 绝对路由 (暂时先去掉吧)
      //   root.push(route)
      } else { // 相对于模块的路由,即子路由
        path = moduleRoute.path + (path ? ('/' + path) : '')
        childs.push(route)
      }
      route.path = path.replace(/\/\//g, '/')
      if (isVue) {
        let vueProp = action.props.vue
        if (vueProp !== false) {
          let vueRoute = {
            component: convertCase(vueCase, `${moduleName}/${moduleName}_${actionName}`),
            name: convertCase(vueCase, `${moduleName}_${actionName}`),
            path: relative,
            methods: route.methods
          }
          vueRoute = Object.assign(vueRoute, vueProp)
          vueModule.children.push(vueRoute)
        }
      }
    }
  }
  let ret = {
    route: moduleRoute,
    childs,
    root
  }
  if (isVue) {
    ret.VueComponent = vueModule
  }
  return ret
}

function convertPath (path, caseType, name) {
  if (!isString(path)) {
    path = convertCase(caseType, name)
  }
  return path
}

/*
  prefix moduleRoute actionRoute
  /api   /account
  actionRoute 生成的后端路由
    article/:id  => /api/account/article/:id // 全部
 */
