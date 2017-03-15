import VueRouter from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

export default function ({routes}) {
  let router = new VueRouter({
    routes
  })
  let vm = new Vue({
    router,
    template: `
<div id="app">
    <router-view class="view"></router-view>
</div>
`
  })
  return {
    router,
    vm
  }
}
