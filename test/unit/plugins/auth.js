import test from 'ava'
import {expect} from 'chai'
import {Router, Exception, authPlugin, auth, get, Api, ApiInterface} from 'sav/index.js'

function createRouter (config) {
  let router = new Router(config)
  router.use(authPlugin)
  @ApiInterface()
  class TestIntf {
    @get()
    @auth()
    test () {}

    @get()
    noop () {}
  }
  @Api(TestIntf)
  class Test {
    test () {}
    noop () {}
  }
  router.declare(Test)
  return router
}

test('no auth', async (ava) => {
  let router = createRouter()
  router.exec({
    path: '/Test/test',
    method: 'GET'
  }).then(() => {
    throw new Error('error')
  }).catch((err) => {
    expect(err instanceof Exception).to.eql(true)
  })
})

test('pass auth', async (ava) => {
  let router = createRouter()
  await router.exec({
    path: '/Test/test',
    method: 'GET'
  })
  // await router.exec({
  //   path: '/Test/noop',
  //   method: 'GET'
  // })
})
