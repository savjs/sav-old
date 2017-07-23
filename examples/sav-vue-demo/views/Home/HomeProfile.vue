<template>
  <div class="home-profile">
    <div>HomeProfile</div>
    <div>{{userProfile}}</div>
    <component is="UserInfo"></component>
  </div>
</template>
<script>
  import UserInfo from '../layouts/UserInfo.vue'
  export default {
    name: 'HomeProfile',
    getters: [
      'userProfile'
    ],
    actions: [
    ],
    components: {
      UserInfo
    },
    beforeRouteEnter (to, from, next) {
      console.log('HomeProfile-beforeRouteEnter', 'to', to, 'from', from)
      next()
    },
    beforeRouteUpdate (to, from, next) {
      console.log('HomeProfile-beforeRouteUpdate', 'to', to, 'from', from)
      next()
    },
    created () {
      console.log('HomeProfile-created')
    }
  }
</script>
