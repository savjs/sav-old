import {convertCase, isString} from '../util'

export function convertRoute (module, caseType = 'camel', prefix = '/') {
  let {props, moduleName} = module
  // 解析模块路由
  let moduleRoute = Object.assign({uri: module.uri}, props.route)
  let relative = convertPath(moduleRoute.path, caseType, moduleName)
  moduleRoute.path = prefix + relative
  let childs = moduleRoute.childs = []
  let parents = moduleRoute.parents = []

  let isVue = props.view === 'vue'
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
    let plugins = action.tasks.map((it) => it.name)
    let getProps = (name) => {
      let index = plugins.indexOf(name)
      if (~index) {
        return action.tasks[index].props
      }
    }
    if (~plugins.indexOf('route')) {
      let {actionName} = action
      let args = getProps('route')
      let route = {
        uri: action.uri,
        path: convertPath(args.path, caseType, actionName),
        methods: args.methods || []
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
      route.path = path.replace(/\/\//g, '/')
      if (isVue) {
        let vueProp = getProps('vue')
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
    SavRoute: moduleRoute
  }
  if (isVue) {
    ret.VueRoute = vueModule
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
