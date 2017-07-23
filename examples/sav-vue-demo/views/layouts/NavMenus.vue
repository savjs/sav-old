<template>
  <div class="nav-menus">
    <ul>
      <li v-for="menu in menus">
        <router-link :to="menu.url">{{menu.title}}</router-link>
      </li>
    </ul>
  </div>
</template>
<script>
  export default {
    getters: [
      'menus'
    ],
    actions: [
      'getPageHomeNavMenu'
    ],
    mounted () {
      this.getPageHomeNavMenu()
    },
    created () {
      console.log('NavMenu-created')
    },
  }
</script>
