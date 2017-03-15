import VueRouter from 'vue-router'
import Vue from 'vue'

export default function ({routes}) {
  let router = new VueRouter({
    routes
  })
  let vm = new Vue({
    router
  })
  return {
    router,
    vm
  }
}
