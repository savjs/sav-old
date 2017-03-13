import test from 'ava'
import {expect} from 'chai'

import {auth, authPlugin, get, Router, gen, props} from 'sav-core'

test('api', (ava) => {
  expect(auth).to.be.a('function')
  expect(authPlugin).to.be.a('function')
})

test('auth.module', async (ava) => {
  @gen
  @props({
    auth: true
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
    auth: async (ctx, access, groups) => {
      console.log(access, groups)
    }
  })

  router.use(authPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/basic',
    method: 'GET'
  }
  await router.route()(ctx)
})
