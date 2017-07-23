import {Vue, VueRouter, Flux, FluxVue} from './VueFlux.js'
import routes from './routes.js'
import App from './App.vue'
import {createRenderer} from 'vue-server-renderer'

let router = new VueRouter(Object.assign({
  mode: 'history',
  routes,
  linkActiveClass: 'is-active'
}))

let flux = new Flux({
  strict: true
})

let vm = new Vue(Object.assign({
  vaf: new FluxVue({flux}),
  router
}, App))

export default {
  router,
  vm,
  flux,
  createRenderer,
  renderOptions: {

  }
}
