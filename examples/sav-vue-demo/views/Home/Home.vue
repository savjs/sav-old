<template>
  <div class="home">
    <nav-menus></nav-menus>
    <router-view></router-view>
  </div>
</template>
<script>
  import NavMenus from '../layouts/NavMenus.vue'
  export default {
    name: 'Home',
    getters: [
    ],
    actions: [
    ],
    components: {
      NavMenus
    },
    beforeRouteEnter (to, from, next) {
      console.log('Home-beforeRouteEnter', 'to', to, 'from', from)
      next()
    },
    beforeRouteUpdate (to, from, next) {
      console.log('Home-beforeRouteUpdate', 'to', to, 'from', from)
      next()
    }
  }
</script>
