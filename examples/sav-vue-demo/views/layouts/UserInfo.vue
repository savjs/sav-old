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
      'getLayoutUserUserInfo'
    ],
    created () {
      console.log('UserInfo-created')
    },
    mounted () {
      this.getLayoutUserUserInfo()
    }
  }
</script>
