import path from 'path'
import {ensureDir, outputFile, pathExists, isClientView, isClientRouter} from '../util.js'
import {pascalCase, hyphenCase} from 'sav-util'

export function writeVue (dir, modals, {force = false}) {
  let opts = {
    force
  }
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .filter(modalName => isClientView(modals[modalName], opts))
    .map((modalName) => writeVueFile(dir, modalName, modals[modalName], opts)))
    .then(() => writeAppVue(dir, opts)))
}

const vueTemplate = `<template>
  <div className>
    <router-view></router-view>
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
    .replace('componentName', modalName)
  if (opts.force || !await pathExists(modalFile)) {
    await outputFile(modalFile, modalData)
  }
  for (let routeName in modal.routes) {
    if (isClientRouter(modal, modal.routes[routeName])) {
      let route = modal.routes[routeName]
      routeName = pascalCase(routeName)
      let component = route.component ? route.component : (`${modalName}/${modalName}${routeName}`)
      let componentName = component.split('/')[1]
      let routeFile = path.resolve(modalPath, componentName + '.vue')
      let routeData = vueTemplate.replace('className', `class="${hyphenCase(componentName)}"`)
        .replace('componentName', componentName)
      if (opts.force || !await pathExists(routeFile)) {
        await outputFile(routeFile, routeData)
      }
    }
  }
}

const appTemplate = `<template>
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

async function writeAppVue (dir, opts) {
  let appPath = path.resolve(dir, 'App.vue')
  if (opts.force || !await pathExists(appPath)) {
    await outputFile(appPath, appTemplate)
  }
}
