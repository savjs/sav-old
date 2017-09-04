<template>
  <div id="app">
    <pre>{{$route}}</pre>
    <router-view class="page-container"></router-view>
  </div>
</template>
<script>
  export default {
    name: 'App',
    getters: [
    ],
    actions: [
    ],
    watch: {
      $route () {
        console.log('route', this.$route)
      }
    }
  }
</script>
