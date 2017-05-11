import {convertCase} from '../util'

/*
  "VueRoute": {
    "component": "Account/Account",
    "path": "/account",
    "children": [
      {
        "component": "Account/AccountLogin",
        "name": "AccountLogin",
        "path": "login",
        "methods": [
          "GET"
        ]
      }
    ]
  }
 */

export function makeVueRoute (module) {
  if (module.props.view !== 'vue') {
    return
  }
  let {SavRoute, moduleName} = module
  let vueCase = 'pascal'
  let vueModuleRoute = {
    component: convertCase(vueCase, `${moduleName}/${moduleName}`),
    path: SavRoute.path,
    children: []
  }
  let maps = mapSavRoute(SavRoute)
  for (let action of module.routes) {
    if (action.props.route) {
      let vueAction = action.props.vue || {props: null}
      if (vueAction.props !== false) {
        let savRoute = maps[action.uri]
        let vueRoute = {
          component: convertCase(vueCase, `${moduleName}/${moduleName}_${action.actionName}`),
          name: convertCase(vueCase, `${moduleName}_${action.actionName}`),
          path: savRoute.relative,
          methods: savRoute.methods
        }
        vueRoute = Object.assign(vueRoute, vueAction.props)
        vueModuleRoute.children.push(vueRoute)
      }
    }
  }
  module.VueRoute = vueModuleRoute
}

function mapSavRoute (savRoute) {
  return [].concat(savRoute.parents).concat(savRoute.childs).reduce((tar, it) => {
    tar[it.uri] = it
    return tar
  }, {})
}

function unique (arr) {
  return arr.filter((it, index) => arr.indexOf(it) === index)
}

// 生成Vue的路由文件
export function createVueRoutes (modules, fromGroup, JSON5) {
  let comps = []
  if (fromGroup) {
    for (let moduleGroup in modules) {
      let group = modules[moduleGroup]
      for (let moduleName in group) {
        let module = group[moduleName]
        if (module.VueRoute) {
          comps.push(module.VueRoute)
        }
      }
    }
  } else {
    for (let moduleName in modules) {
      let module = modules[moduleName]
      if (module.VueRoute) {
        comps.push(module.VueRoute)
      }
    }
  }
  let routes = JSON5 ? JSON5.stringify(comps, null, 2) : JSON.stringify(comps, null, 2)
  let components = []
  let names = []
  let files = []
  routes = routes.replace(JSON5 ? /component:\s+"((\w+)\/(\w+))"/g
    : /"component":\s+"((\w+)\/(\w+))"/g, (_, path, dir, name) => {
    let file = `./${path}.vue`
    components.push(`import ${name} from '${file}'`)
    names.push(name)
    files.push(file)
    let ret = `component: ${name}`
    return ret
  })
  // 去重
  files = unique(files)
  components = unique(components)
  names = unique(names)

  let arr = [].concat(components).concat([''])
    .concat(names.map((it) => `${it}.name = '${it}'`)).concat([''])
    .concat(`export default ${routes}`)
  let content = arr.join('\n')
  return {
    content,
    components,
    names,
    files
  }
}
