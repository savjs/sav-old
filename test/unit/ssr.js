import test from 'ava'
import {expect} from 'chai'
import {Sav} from 'sav'
import Koa from 'koa'
import {createRenderer} from 'vue-server-renderer'
import Vue from 'vue'
import VueRouter from 'vue-router'
import supertest from 'supertest'
import bodyParser from 'koa-bodyparser'

let sav
let request

test.before(() => {
  Vue.use(VueRouter)
  sav = new Sav({
    ssr: true
  })
  sav.vueRender.serverTemplate = `<!--vue-ssr-outlet-->`
  let routes = [
    {
      component: {
        template: `<div class="page-home">
          <h2>Home</h2>
          <header-info></header-info>
          <router-view class="view-container"></router-view>
        </div>
        `,
        components: {
          headerInfo: {
            template: '<header>header</header>',
            payload ({query}) {
              return [
                {path: '/home/info', query}
              ]
            }
          }
        }
      },
      path: '/home',
      children: [
        {
          component: {
            name: 'HomeAbout',
            template: '<h2>{{title}}</h2>',
            getters: ['title'],
            payload (route) {
              return route
            }
          },
          name: 'HomeAbout',
          path: 'about'
        },
        {
          component: {
            name: 'HomeProfile',
            template: '<h2>{{name}}</h2>',
            getters: ['name'],
            payload: true
          },
          name: 'HomeProfile',
          path: 'profile/:uid'
        }
      ]
    }
  ]
  let router = new VueRouter({
    mode: 'history',
    routes
  })
  let vm = new Vue({
    router,
    template: `<div id="app">
    <pre>{{$route.path}}</pre>
    <router-view class="page-container"></router-view>
  </div>
    `
  })
  sav.vueRender.serverEntry = {
    router,
    vm,
    Vue,
    createRenderer,
    renderOptions: {}
  }
  let app = new Koa()
  app.use(bodyParser())
  app.use(sav.compose())
  request = supertest(app.listen())
})

test('api', async (ava) => {
  sav.declare({
    actions: {
      Home: {
        about () {
          return {title: 'AboutAction'}
        },
        profile (_, {params}) {
          return {name: 'ProfileAction', params}
        },
        info (_, route) {
          return {userId: 1}
        }
      }
    },
    modals: {
      Home: {
        view: true,
        routes: {
          about: {},
          info: {
            response: {
              props: {
                userId: Number
              }
            }
          },
          profile: {
            method: 'GET',
            path: 'profile/:uid'
          }
        }
      }
    }
  })
  request.get('/home/about').accept('html').then((res) => {
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('AboutAction')).to.not.eql(-1)
  })
  request.get('/home/profile/1').accept('html').then((res) => {
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('ProfileAction')).to.not.eql(-1)
  })
})
