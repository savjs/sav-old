import {requireFromString} from './vue-builder.js'
import {quickConf} from '../decorator'
import {isString} from '../utils/type'

export const vue = quickConf('vue')

// import VueRouter from 'vue-router'
// import Vue from 'vue'

// let router = new VueRouter({
//   routes
// })

// let vm = new Vue({
//   router
// })

export function vuePlugin (ctx) {
  let vueOptions = ctx.config('vue')

  let test = requireFromString('exports.xxx ="requireFromString"')
  console.log(test.xxx)

  let createRender = (opts) => {
    opts = Object.assign({}, vueOptions, opts)
    if (opts.action) {

    } else if (opts.module) {
      createModuleRoutes(opts)
    } else {

    }
    // let modules = ctx.modules
    // let routes = []
    // for (let moduleName in modules) {
    //   let module = modules[moduleName]
    //   let moduleRoute = module.route
    //   let route = {
    //     name: moduleName,
    //     path: moduleRoute.relative,
    //     children: []
    //   }
    //   routes.push(route)
    //   let children = route.children
    //   for (let actionName in module.actions) {
    //     let action = module.actions[actionName]
    //     let actionRoute = action.route
    //     let childRoute = {
    //       name: actionRoute.name,
    //       path: actionRoute.relative
    //     }
    //     children.push(childRoute)
    //   }
    // }
    // console.log(JSON.stringify(routes, null, 4))

    return async function vueRender () {

    }
  }

  let defaultRender

  ctx.use({
    module (module) {
      let vueProp = module.props.vue
      if (vueProp) {
        if (vueProp === true) {
          module.isVueApp = true
          module.vueRender = defaultRender || (defaultRender = createRender())
        } else {
          module.isVueModule = true
          module.vueRender = createRender(Object.assign({module}, vueObject(vueProp)))
        }
      }
    },
    action (action) {
      let {module} = action
      let vueProp = module.props.vue
      if (vueProp) {
        action.isVueAction = true
        action.vueRender = createRender(Object.assign({action}, vueObject(vueProp[0])))
      } else if (module.vueRender) {
        action.isVueModule = true
        action.vueRender = module.vueRender.bind(action)
      } else {
        return
      }
      action.set('vue', (context) => {
        context.vueRender = action.vueRender
      })
    }
  })
}

function createModuleRoutes ({module}) {

}

function vueObject (vue) {
  if (isString(vue)) {
    return {file: vue}
  }
  return vue
}

export function vueRender (opts) {
  return async (context) => {
    return context.vueRender
  }
}
