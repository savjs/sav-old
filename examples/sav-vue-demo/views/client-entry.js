import {Vue, VueRouter, Flux, FluxVue} from './VueFlux.js'
import routes from './routes.js'
import App from './App.vue'
import {resolveContract} from '../../../dist/sav-client.js'
import contract from  '../contract'

let router = new VueRouter(Object.assign({
  mode: 'history',
  routes,
  linkActiveClass: 'is-active'
}))

let flux = new Flux({
  strict: true,
  mockState: true
})

flux.on('schemaRequired', (lists) => {
  console.log('schemaRequired', lists)
})

resolveContract({contract, flux, router}).then(() => {
  if (typeof window !== 'undefined') {
    if (window.INIT_STATE) {
      flux.replaceState(window.INIT_STATE)
    }
  }
  let vaf = new FluxVue({flux})
  let vm = new Vue(Object.assign({
    vaf, 
    router
  }, App))
  let app = {
    router,
    vm,
    flux
  }
  vm.$mount('#app')
  window.app = app
})
