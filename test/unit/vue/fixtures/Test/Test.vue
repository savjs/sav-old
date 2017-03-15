<template>
  <div>
    <h2>{{title}}</h2>
    <router-view></router-view>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        title: 'Test'
      }
    }
  }
</script>