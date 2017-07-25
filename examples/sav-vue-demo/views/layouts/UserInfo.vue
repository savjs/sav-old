<template>
  <div class="user-info">
    {{userInfo}}
  </div>
</template>
<script>
  export default {
    getters: [
      'userInfo'
    ],
    actions: [
    ],
    payload ({dispatch}) {
      return dispatch('getHomeUserInfo')
    }
  }
</script>
