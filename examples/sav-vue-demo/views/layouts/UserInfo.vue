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
      'getPageHomeUserInfo'
    ],
    created () {
      console.log('UserInfo-created')
    },
    mounted () {
      this.getPageHomeUserInfo()
    }
  }
</script>
