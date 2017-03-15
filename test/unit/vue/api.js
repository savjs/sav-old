import test from 'ava'
import {expect} from 'chai'
import {resolve} from 'path'
import {Router, get, gen, props, vuePlugin, vue} from 'sav-core'

test('api', (ava) => {
  expect(vuePlugin).to.be.a('function')
  expect(vue).to.be.a('function')
})

test('vue.mode.app', async (ava) => {
  @gen
  @props({
    vue: true
  })
  class Test {
    @get()
    async basic (ctx) {
      ctx.state = {
        title: 'Basic Title'
      }
    }

    @get()
    async profile (ctx) {
      ctx.state = {
        title: 'Profile Title'
      }
    }

    @get()
    @vue(false)
    async single (ctx) {
      ctx.state = {
        title: 'Single vue'
      }
    }
  }

  let router = new Router({
    vueRoot: resolve(__dirname, 'fixtures')
  })

  router.use(vuePlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/basic',
    method: 'GET'
  }
  await router.route()(ctx)
})

test('vue.mode.module', async (ava) => {
  @gen
  @props({
    vue: {
      instance: true
    }
  })
  class Test {
    @get()
    async basic (ctx) {
      ctx.state = {
        title: 'Basic Title'
      }
    }
  }

  let router = new Router({
    vueRoot: resolve(__dirname, 'fixtures')
  })

  router.use(vuePlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/basic',
    method: 'GET'
  }
  await router.route()(ctx)
})
