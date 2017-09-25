/**
 * 生成 vue 目录的内容
 */

import path from 'path'
import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile,
    pathExists, isClientView, isClientRouter, putDirFileContent} from '../util.js'
import {pascalCase, hyphenCase, camelCase, prop, isString} from 'sav-util'

export function writeVue (dir, modals, options) {
  let opts = Object.assign({
    force: false
  }, options)
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .filter(modalName => isClientView(modals[modalName], opts))
    .map((modalName) => writeVueFile(dir, modalName, modals[modalName], opts))))
    .then((args) => writeVueRouter(dir, args, opts))
    .then(() => Promise.all([
      putDirFileContent(dir, opts, 'App.vue', appVue),
      putDirFileContent(dir, opts, 'client-plugins.js', clientPlugins),
      putDirFileContent(dir, opts, 'client-entry.js', clientEntry),
      putDirFileContent(dir, opts, 'server-plugins.js', serverPlugins),
      putDirFileContent(dir, opts, 'server-entry.js', serverEntry),
      putDirFileContent(dir, opts, 'index.html', indexHtml)
    ]))
}

function writeVueRouter (dir, components, opts) {
  let routes = JSON5.stringify(components, null, 2)
  let imports = components.reduce((a, b) => {
    b.files.forEach(([name, file]) => {
      a.push(`import ${name} from './${file}'`)
    })
    return a
  }, [])
  routes = routes.replace(/component:\s+"(\w+)"/g, (_, name) => {
    return `component: ${name}`
  })
  let content = unique(imports).concat([''])
    .concat(`export default ${routes}`).join('\n')

  let routePath = path.resolve(dir, 'routes.js')
  return outputFile(routePath, `${noticeString}${content}\n`)
}

function unique (arr) {
  return arr.filter((it, index) => arr.indexOf(it) === index)
}

const vueTemplate = `<template>
  <div className>
    <h2>RouteName</h2>
    <router-view class="view-container"></router-view>
  </div>
</template>
<script>
  export default {
    name: 'componentName',
    getters: [
    ],
    actions: [
    ]
  }
</script>
`

async function writeVueFile (dir, modalName, modal, opts) {
  modalName = pascalCase(modalName)
  let modalPath = path.resolve(dir, modalName)
  await ensureDir(modalPath)
  let modalFile = path.resolve(modalPath, modalName + '.vue')
  let modalData = vueTemplate.replace('className', `class="page-${hyphenCase(modalName)}"`)
    .replace('RouteName', modalName)
    .replace('componentName', modalName)
  if (opts.force || !await pathExists(modalFile)) {
    await outputFile(modalFile, modalData)
  }
  let modalComponent = {
    component: modalName,
    path: isString(modal.path) ? modal.path : camelCase(modalName),
    children: []
  }
  if (modalComponent.path) {
    if (modalComponent.path[0] !== '/') {
      modalComponent.path = '/' + modalComponent.path
    }
  }
  let files = [
    [modalName, `${modalName}/${modalName}.vue`]
  ]
  for (let routeName in modal.routes) {
    if (isClientRouter(modal, modal.routes[routeName])) {
      let route = modal.routes[routeName]
      routeName = pascalCase(routeName)
      // eg: Article/ArticleViews
      let component = route.component ? route.component : (`${modalName}/${modalName}${routeName}`)
      let routeFile = path.resolve(dir, component + '.vue')
      // eg: ArticleViews
      let componentName = component.split('/')[1]
      let routeData = vueTemplate.replace('className', `class="${hyphenCase(componentName)}"`)
        .replace('    <router-view class="view-container"></router-view>\n', '')
        .replace('RouteName', `${modalName}${routeName}`)
        .replace('componentName', componentName)
      if (opts.force || !await pathExists(routeFile)) {
        await outputFile(routeFile, routeData)
      }
      let routeComponent = {
        component: componentName,
        name: `${modalName}${routeName}`,
        path: isString(route.path) ? route.path : camelCase(routeName)
      }
      files.push([componentName, `${component}.vue`])
      modalComponent.children.push(routeComponent)
    }
  }
  prop(modalComponent, 'files', files)
  return modalComponent
}

const appVue = `<template>
  <div id="app">
    <router-view class="page-container"></router-view>
  </div>
</template>
<script>
  export default {
    name: 'App',
    getters: [
    ],
    actions: [
    ]
  }
</script>
`

const clientPlugins = `${noticeString}// npm i -D vue vue-router sav-flux
// 全局的VUE组件需要在这里注册
// 其他需要用Vue的需要从这里引入
import VueRouter from 'vue-router'
import Vue from 'vue'
import {Flux, FluxVue} from 'sav-flux'

Vue.use(VueRouter)
Vue.use(FluxVue)

export {Vue}
export {VueRouter}
export {Flux}
export {FluxVue}
`

const clientEntry = `${noticeString}// 程序入口文件
// 宏定义采用注释的方式, 需要打包工具根据环境变量来匹配
// 区块宏 IS_DEV     是否开发环境
// 区块宏 IS_PROD    是否生产环境
// 区块宏 IS_MOCK    是否mock环境
// 区块宏 IS_LOCAL   是否本地环境

import {Vue, VueRouter, Flux, FluxVue} from './client-plugins.js'
import routes from './routes.js'
import App from './App.vue'

// 定义路由

let routerMode

// #if IS_LOCAL
routerMode = 'hash'
// #endif

if (!routerMode) {
  routerMode = 'history'
}

let router = new VueRouter(Object.assign({
  mode: routerMode,
  routes,
  linkActiveClass: 'is-active'
}))

let flux = new Flux({
// #if IS_DEV
  noProxy: true, // 开发模式下不使用Proxy方便调用dispatch
// #endif
// #if IS_MOCK
  mockState: true,
// #endif
  strict: true
})

// flux服务在这里嵌入
// flux.declare(...)

let ret = {}

export default ret

let vm = new Vue(Object.assign({
  vaf: new FluxVue({flux, router}),
  router
}, App))

vm.$mount('#app')

Object.assign(ret, {
  router,
  vm,
  flux
})

`

const serverPlugins = `${noticeString}// npm i -D vue vue-router
// 全局的VUE组件需要在这里注册
// 其他需要用Vue的需要从这里引入
import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

export {Vue}
export {VueRouter}
`

const serverEntry = `${noticeString}// npm i -D vue-server-renderer
import {Vue, VueRouter} from './server-plugins.js'
import routes from './routes.js'
import App from './App.vue'
import {createRenderer} from 'vue-server-renderer'

let router = new VueRouter(Object.assign({
  mode: 'history',
  routes,
  linkActiveClass: 'is-active'
}))

let vm = new Vue(Object.assign({
  router
}, App))

export default {
  router,
  vm,
  createRenderer,
  renderOptions: {
  }
}
`

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sav-App</title>
</head>
<body>
  <!--vue-ssr-outlet-->
  <script type="text/javascript" src="/js/vue.js"></script>
  <script type="text/javascript" src="/js/vue-router.js"></script>
  <script type="text/javascript" src="/js/client-entry.js"></script>
</body>
</html>`
