
export function vuePlugin (sav) {
  // let {config} = sav
  let vueMiddleware = (ctx) => {
    if (ctx.isHtml) {
      ctx.setVue()
    }
  }
  sav.use({
    module (module) {
      if (module.props.view === 'vue') {
        for (let route of module.routes) {
          if (!route.props.vue) {
            route.prependMiddleware({
              name: 'vue',
              props: null
            })
          }
          route.props.vue.setMiddleware(vueMiddleware)
        }
      }
    }
  })
}
