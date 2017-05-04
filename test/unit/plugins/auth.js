import test from 'ava'
import {expect} from 'chai'
import {Router, Exception, authPlugin, auth, get, Api, ApiInterface} from 'sav/index.js'

@ApiInterface()
class Test {
  @get()
  @auth()
  test () {}

  @get()
  noop () {}
}

function createRouter (config) {
  let router = new Router(config)
  router.use(authPlugin)

  class TestApi {
    test () {}
    noop () {}
  }
  let mod = Api(JSON.parse(JSON.stringify(Test)))(TestApi)
  router.declare(mod)
  return router
}

test('no auth', async (ava) => {
  let router = createRouter()
  try {
    await router.exec({
      path: '/test/test',
      method: 'GET'
    })
  } catch (err) {
    expect(err instanceof Exception).to.eql(true)
  }
  await router.exec({
    path: '/test/noop',
    method: 'GET'
  })
})

test('pass auth', async (ava) => {
  let router = createRouter({
    auth () {}
  })
  await router.exec({
    path: '/test/test',
    method: 'GET'
  })
})
