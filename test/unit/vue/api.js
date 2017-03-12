import test from 'ava'
import {expect} from 'chai'

import {viewPlugin, Router, get, gen, props, vuePlugin, vueRender, vue} from 'sav-core'

test('api', (ava) => {
  expect(vuePlugin).to.be.a('function')
  expect(vueRender).to.be.a('function')
})

test('vue.view', async (ava) => {
  @gen
  @props({
    viewLayout: 'fixtures/basic.vue',
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
    viewRoot: __dirname,
    viewEngines: {
      vue: vueRender()
    }
  })

  router.use(viewPlugin)
  router.use(vuePlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/basic',
    method: 'GET'
  }
  await router.route()(ctx)
})
