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
    payload ({dispatch}) {
      return dispatch('getHomeIndex')
    }
  }
</script>
