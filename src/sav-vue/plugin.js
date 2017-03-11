// import {rollup, config} from './rollup.config'

export function vuePlugin (ctx) {
  let vueOptions = ctx.config('vue')

  let createRender = (opts) => {
    opts = Object.assign({}, vueOptions, opts)
    // console.log(opts, rollup, config)

    return async () => {

    }
  }

  let defaultRenderer

  ctx.use({
    module (module, {ctx}) {
      let vue = module.props.vue
      if (vue) {
        if (vue === true) {
          module.vueRenderer = defaultRenderer || (defaultRenderer = createRender())
        } else {
          module.vueRenderer = createRender(vue)
        }
      }
    },
    middleware ({name, args}, {ctx, module, action, middlewares}) {
      if (module.vueRenderer && !action.isBindVue) {
        action.isBindVue = true
        middlewares.push(async (context) => {
          context.vueRenderer = module.vueRenderer
        })
      }
    }
  })
}
