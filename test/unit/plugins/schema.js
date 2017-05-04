import test from 'ava'
import {expect} from 'chai'

import {Router, schemaPlugin, res, req, get, ApiModule} from 'sav/index.js'
import {Schema} from 'sav-schema'

function createRouterSchema () {
  let schema = new Schema()
  let router = new Router({
    schema
  })
  router.use(schemaPlugin)

  @ApiModule()
  class Test {
    @res()
    @get('profile/:uid')
    @req()
    profile ({setState}) {
      setState({
        name: 'jetiny'
      })
    }

    @res('UserProfile')
    @get()
    @req('GetUserProfile')
    profile1 ({setState}) {
      setState({
        name: 'jetiny1'
      })
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
    profile2 ({setState}) {
      setState({
        name: 'jetiny2'
      })
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
    path: '/test/profile/123',
    method: 'GET'
  }
  await router.exec(ctx)
  expect(ctx.body).to.eql({name: 'jetiny'})
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
  await router.exec({
    path: '/test/profile1',
    method: 'GET',
    query: {
      uid: '123'
    }
  })
})

test('schemaPlugin.directSchema', async (ava) => {
  let [router] = createRouterSchema()
  await router.exec({
    path: '/test/profile2',
    method: 'GET',
    request: {
      body: {
        uid: '123'
      }
    }
  })
})

test('schemaPlugin.noSchema', async (ava) => {
  let [router] = createRouterSchema()
  await router.exec({
    path: '/test/profileNull',
    method: 'GET'
  })
  expect(1)
})
