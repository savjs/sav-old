import VueRouter from 'vue-router'
import Vue from 'vue'
import {Flux, FluxVue} from 'sav-flux'
import Components from './components/index.js'

Vue.use(VueRouter)
Vue.use(FluxVue)
Vue.use(Components)

import App from './App.vue'

export default function ({routes}) {
  let router = new VueRouter({
    mode: 'history',
    routes
  })
  let flux = new Flux({
    strict: true // enable this for promise action to resolve data copy
  })

  flux.declare({
    actions: {
      replaceHistoryState (_, {url, state}) {
        if (state.title) {
          document.title = state.title
        }
        flux.updateState(state)
        app.hotReplace = true
        router.replace(url)
        app.hotReplace = false
      }
    }
  })

  if (typeof window !== 'undefined') {
    if (window.INIT_STATE) {
      flux.replaceState(window.INIT_STATE)
    }
  }
  let vaf = new FluxVue({
    flux
  })
  let vm = new Vue({
    vaf,
    router,
    ...App
  })
  let app = {
    router,
    vm,
    flux,
    Vue,
    vaf
  }
  return app
}
