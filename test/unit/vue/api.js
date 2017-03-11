import test from 'ava'
import {expect} from 'chai'

import {viewPlugin} from 'sav-router-view'

import {Router, get} from 'sav-router'
import {gen, props} from 'sav-decorator'
import {vuePlugin, vueRender} from 'sav-vue'

test('api', (ava) => {
  expect(vuePlugin).to.be.a('function')
  expect(vueRender).to.be.a('function')
})

test('vue.view', (ava) => {
  @gen
  @props({
    viewLayout: 'fixtures/basic.vue',
    vue: true
  })
  class Test {
    @get
    async basic (ctx) {
      ctx.state = {
        title: 'Basic Title'
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
})
