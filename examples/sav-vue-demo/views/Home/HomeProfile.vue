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
    payload ({dispatch, route}) {
      return dispatch('getHomeProfile', route)
    }
  }
</script>
