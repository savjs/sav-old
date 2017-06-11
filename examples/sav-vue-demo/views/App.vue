<template>
  <div id="app">
    <router-link :to="{name: 'HomeAbout'}">HomeAbout</router-link>
    <router-link :to="{name: 'HomeIndex'}">HomeIndex</router-link>
    <router-view class="view"></router-view>
  </div>
</template>
<script>
  export default {
    name: 'App',
    getters: [
    ],
    actions: [
    ]
  }
</script>
