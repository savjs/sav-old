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
    acctions: [
    ],
    components: {
      NavMenus
    }
  }
</script>
