<template>
  <div class="home-about">
    <div>HomeAbout</div>
    <component is="UserInfo"></component>
  </div>
</template>
<script>
  import UserInfo from '../layouts/UserInfo.vue'
  export default {
    name: 'HomeAbout',
    getters: [
    ],
    actions: [
    ],
    components: {
      UserInfo
    },
    payload ({dispatch}) {
      return dispatch('getHomeAbout')
    }
  }
</script>
