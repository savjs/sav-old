<template>
  <div id="app">
    <router-link :to="{name: 'HomeIndex'}">HomeIndex</router-link>
    <router-link :to="{name: 'HomeAbout'}">HomeAbout</router-link>
    <router-link :to="{name: 'HomeProfile', params: {uid: 1}}">HomeProfile</router-link>
    <router-link :to="{name: 'ArticlePosts'}">ArticlePosts</router-link>
    <router-link :to="{name: 'ArticleView', params: {aid: 1}}">ArticleView</router-link>
    <router-link :to="{name: 'ArticleUpdate', params: {aid: 1}}">ArticleUpdate</router-link>
    <router-link :to="{name: 'ArticleModify', params: {aid: 1}}">ArticleModify</router-link>
    <router-view class="page-container"></router-view>
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
