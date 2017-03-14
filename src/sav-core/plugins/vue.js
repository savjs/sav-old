// import {requireFromString} from './vue-builder.js'
import {quickConf} from '../decorator'
import {isObject} from '../utils/type'
import {convertCase} from '../utils/convert'

export const vue = quickConf('vue')

// import VueRouter from 'vue-router'
// import Vue from 'vue'

// let router = new VueRouter({
//   routes
// })

// let vm = new Vue({
//   router
// })

const RENDER_MODE_APP = 1
const RENDER_MODE_MODULE = 2
const RENDER_MODE_ACTION = 3

class VueRenderer {
  constructor (props) {
    this.props = props
    this.isCompiled = false
    this.modules = {}
    this.mode = RENDER_MODE_APP
  }
  async render (context, state) {
    if (!this.isCompiled) {
      this.compile()
    }
  }
  compile () {
    console.log(JSON.stringify(this.generateRoute(), null, 2))
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
        path: route.relative,
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
    let dist = []
    for (let moduleName in modules) {
      if (this.mode === RENDER_MODE_APP) {
        dist.push(modules[moduleName])
      } else {
        dist.push(modules[moduleName])
        break
      }
    }
    // "component":\s+"(\w+\/\w+)",
    return dist
  }
}

export function vuePlugin (ctx) {
  let vueRoot = ctx.config('vueRoot', '')
  let vueCase = ctx.config('vueCase', 'pascal')
  let vueFileCase = ctx.config('vueFileCase', 'pascal')
  let vueOpts = {
    vueRoot,
    vueCase,
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
