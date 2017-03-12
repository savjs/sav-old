import test from 'ava'
import {expect} from 'chai'

import {schemaPlugin, req, res, Router, get, gen} from 'sav-core'

import {Schema} from 'sav-schema'

test('api', (ava) => {
  expect(schemaPlugin).to.be.a('function')
  expect(req).to.be.a('function')
  expect(res).to.be.a('function')
})

function createRouterSchema () {
  let schema = new Schema()
  let router = new Router({
    schema
  })
  router.use(schemaPlugin)
  @gen
  class Test {
    @res()
    @get('profile/:uid')
    @req()
    async profile (ctx) {
      ctx.state = {
        name: 'jetiny'
      }
    }

    @res('UserProfile')
    @get()
    @req('GetUserProfile')
    async profile1 (ctx) {
      ctx.state = {
        name: 'jetiny1'
      }
    }

    @res({
      props: {
        name: String
      }
    })
    @get()
    @req({
      props: {
        uid: Number
      }
    })
    async profile2 (ctx) {
      ctx.state = {
        name: 'jetiny2'
      }
    }

    @res()
    @get()
    @req()
    async profileNull (ctx) {

    }
  }
  router.declare(Test)
  return [router, schema]
}

test('schemaPlugin.autoSchema', async (ava) => {
  let [router, schema] = createRouterSchema()
  schema.declare([
    {
      name: 'ReqTestProfile',
      props: {
        uid: Number
      }
    },
    {
      name: 'ResTestProfile',
      props: {
        name: String
      }
    }
  ])
  let ctx = {
    path: '/Test/profile/123',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.state).to.eql({name: 'jetiny'})
})

test('schemaPlugin.namedSchema', async (ava) => {
  let [router, schema] = createRouterSchema()
  schema.declare([
    {
      name: 'GetUserProfile',
      props: {
        uid: Number
      }
    },
    {
      name: 'UserProfile',
      props: {
        name: String
      }
    }
  ])
  await router.route()({
    path: '/Test/profile1',
    method: 'GET',
    query: {
      uid: '123'
    }
  })
})

test('schemaPlugin.directSchema', async (ava) => {
  let [router] = createRouterSchema()
  await router.route()({
    path: '/Test/profile2',
    method: 'GET',
    request: {
      body: {
        uid: '123'
      }
    },
    setState () {}
  })
})

test('schemaPlugin.noSchema', async (ava) => {
  let [router] = createRouterSchema()
  await router.route()({
    path: '/Test/profileNull',
    method: 'GET'
  })
})
