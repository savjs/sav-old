import {compileImport, renderer} from './vue-builder.js'
import {quickConf} from '../decorator'
import {isObject} from '../utils/type'
import {convertCase} from '../utils/convert'

import {resolve} from 'path'
import fs from 'fs'
import {Promise} from 'bluebird'

const {readFileAsync, writeFileAsync} = Promise.promisifyAll(fs)

const {renderToStringAsync} = Promise.promisifyAll(renderer)

export const vue = quickConf('vue')

const RENDER_MODE_APP = 1
const RENDER_MODE_MODULE = 2
const RENDER_MODE_ACTION = 3

class VueRenderer {
  constructor (props) {
    this.props = props
    this.isCompiled = false
    this.modules = {}
    this.mode = RENDER_MODE_APP
    this.vueInstance = null
  }
  async render (ctx, state) {
    if (!this.isCompiled) {
      await this.compileImport()
    }
    try {
      let {vm, router} = this.vueInstance
      let path = ctx.path || ctx.originalUrl
      router.push(path)
      // console.log(router.getMatchedComponents())
      let text = await renderToStringAsync(vm)
      ctx.end(text)
    } catch (err) {
      this.isCompiled = false
      throw err
    }
  }
  async compileImport () {
    let factory = await this.compileVueInstance()
    let routes = await this.compileVueRoute()
    let ret = factory({routes})
    this.vueInstance = ret
  }
  createRoute (action) {
    let {vueFileCase, vueCase} = this.props
    let {actionName, vueProp, route, module} = action
    let moduleName = module.moduleName
    let name = convertCase(vueCase, `${moduleName}_${actionName}`)
    let actionRoute = {
      component: convertCase(vueFileCase, `${moduleName}/${moduleName}_${actionName}`),
      path: route.relative,
      name
    }
    actionRoute = vueProp ? Object.assign({}, actionRoute, vueProp) : actionRoute
    let moduleRoute
    if (!this.modules[moduleName]) {
      let {vueProp, route} = module
      let name = convertCase(vueCase, moduleName)
      moduleRoute = {
        component: convertCase(vueFileCase, `${moduleName}/${moduleName}`),
        path: route.path,
        name,
        children: []
      }
      this.modules[moduleName] = vueProp ? Object.assign({}, moduleRoute, vueProp) : moduleRoute
    }
    moduleRoute = this.modules[moduleName]
    moduleRoute.children.push(actionRoute)
  }
  generateRoute () {
    let modules = this.modules
    let comps = []
    for (let moduleName in modules) {
      if (this.mode === RENDER_MODE_APP) {
        comps.push(modules[moduleName])
      } else {
        comps.push(modules[moduleName])
        break
      }
    }
    let routes = JSON.stringify(comps, null, 2)
    let components = []
    routes = routes.replace(/"component":\s+"((\w+)\/(\w+))"/g, (_, path, dir, name) => {
      components.push(`import ${name} from './${path}.vue'`)
      let ret = `"component": ${name}`
      return ret
    })
    components.push(`export default ${routes}`)
    let content = components.join('\n')
    return {
      comps,
      content
    }
  }
  saveVueRouter () {
    let {comps, content} = this.generateRoute()
    let routeName
    switch (this.mode) {
      case RENDER_MODE_APP:
        routeName = 'Routes.js'
        break
      case RENDER_MODE_MODULE:
        routeName = comps[0].name + 'Routes.js'
        break
      case RENDER_MODE_ACTION:
        routeName = comps[0].children[0].name + 'Routes.js'
        break
    }
    let routePath = resolve(this.props.vueRoot, routeName)
    return syncFile(routePath, content).then(() => routePath)
  }
  compileVueRoute () {
    return this.saveVueRouter().then(compileImport)
  }
  compileVueInstance () {
    let entryFile = resolve(this.props.vueRoot, this.props.vueEntry)
    return compileImport(entryFile).then()
  }
}

function syncFile (path, data) {
  return readFileAsync(path)
    .then((text) => {
      if (text.toString() !== data) {
        return writeFileAsync(path, data)
      }
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return writeFileAsync(path, data)
      }
      throw err
    })
}

export function vuePlugin (ctx) {
  let vueRoot = ctx.config('vueRoot', '')
  let vueEntry = ctx.config('vueEntry', 'server-entry.js')
  let vueCase = ctx.config('vueCase', 'pascal')
  let vueFileCase = ctx.config('vueFileCase', 'pascal')
  let vueOpts = {
    vueRoot,
    vueCase,
    vueEntry,
    vueFileCase
  }

  let createRender = (opts) => {
    return new VueRenderer(Object.assign({}, vueOpts, opts))
  }

  let defaultRender

  ctx.use({
    module (module) {
      let vueProp = module.props.vue
      if (vueProp) {
        let vueRender = defaultRender || (defaultRender = createRender())
        if (isObject(vueProp)) {
          if (vueProp.instance) {
            vueRender = createRender(vueProp)
            vueRender.mode = RENDER_MODE_MODULE
          } else {
            module.vueProp = vueProp
          }
          module.vueRender = vueRender
        } else if (vueProp === true) {
          module.vueRender = vueRender
        }
      }
    },
    action (action) {
      let {module} = action
      let vueProp = action.props.vue
      let vueRender
      if (vueProp) {
        vueProp = vueProp[0]
        if (vueProp === false) {
          return
        }
        if (vueProp === true) {
          vueRender = module.vueRender
        } else if (isObject(vueProp)) {
          if (vueProp.instance) {
            vueRender = createRender(vueProp)
            vueRender.mode = RENDER_MODE_ACTION
          } else {
            action.vueProp = vueProp
          }
        }
      } else if (module.vueRender) {
        vueRender = module.vueRender
      } else {
        return
      }
      vueRender.createRoute(action)
      action.set('vue', async (context) => {
        await vueRender.render(context, context.state)
      })
    }
  })
}
