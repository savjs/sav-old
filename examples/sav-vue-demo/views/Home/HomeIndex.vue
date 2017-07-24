<template>
  <div class="home-index">
    <div>HomeIndex-{{welcome}}</div>
    <component is="UserInfo"></component>
  </div>
</template>
<script>
  import UserInfo from '../layouts/UserInfo.vue'
  export default {
    name: 'HomeIndex',
    getters: [
      'welcome'
    ],
    actions: [
    ],
    components: {
      UserInfo
    },
    payload ({dispatch, route}) {
      return dispatch('getPageHomeIndex', route.fullPath)
    },
    beforeRouteEnter (to, from, next) {
      console.log('HomeIndex-beforeRouteEnter', 'to', to, 'from', from)
      next()
    },
    created () {
      console.log('HomeIndex-created')
    },
  }
</script>
