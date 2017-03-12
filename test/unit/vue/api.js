import test from 'ava'
import {expect} from 'chai'

import {Router, get, gen, props, vuePlugin, vueRender, vue} from 'sav-core'

test('api', (ava) => {
  expect(vuePlugin).to.be.a('function')
  expect(vueRender).to.be.a('function')
})

test('vue.view', async (ava) => {
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
    @vue()
    async single (ctx) {
      ctx.state = {
        title: 'Single vue'
      }
    }
  }

  let router = new Router({
    viewRoot: __dirname
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
