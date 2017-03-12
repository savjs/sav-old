// import {requireFromString} from './vue-builder.js'
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

class VueRenderer {
  constructor (props) {
    this.props = props
    this.isCompiled = false
  }
  async render (context, state) {
    if (!this.isCompiled) {
      this.compile()
    }
  }
  compile () {
    let {module, action} = this.props
    if (module) {
      console.log('module', module.moduleName)
    } else if (action) {
      console.log('action', action.actionName)
    } else {
      console.log('global')
    }
  }
}

export function vuePlugin (ctx) {
  let vueOptions = ctx.config('vue')

  let createRender = (opts) => {
    return new VueRenderer(Object.assign({}, vueOptions, opts))
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
      let vueProp = action.props.vue
      if (vueProp) {
        action.isVueAction = true
        action.vueRender = createRender(Object.assign({action}, vueObject(vueProp[0])))
      } else if (module.vueRender) {
        action.isVueModule = true
        action.vueRender = module.vueRender
      } else {
        return
      }
      action.set('vue', async (context) => {
        await action.vueRender.render(context, context.state)
      })
    }
  })
}

function vueObject (vue) {
  if (isString(vue)) {
    return {file: vue}
  }
  return vue
}

export function vueRender (opts) {
  return (context) => {
    return async (vueFile, state) => {
      console.log('bbb')
      await context.vueRender.render(context, state)
    }
  }
}
