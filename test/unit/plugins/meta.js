import test from 'ava'
import {expect} from 'chai'
import {Router, metaPlugin, meta, get, Api, ApiInterface} from 'sav/index.js'

@ApiInterface()
class Test {
  @get()
  @meta({
    charset: 'utf-8'
  })
  test () {}

  @get()
  noop () {}
}

function createRouter (config) {
  let router = new Router(config)
  router.use(metaPlugin)

  class TestApi {
    test () {}
    noop () {}
  }
  let mod = Api(JSON.parse(JSON.stringify(Test)))(TestApi)
  router.declare(mod)
  return router
}

test('meta', async (ava) => {
  let router = createRouter()
  {
    let ctx = await router.exec({
      path: '/test/test',
      method: 'GET'
    })
    expect(ctx.body).to.eql({ meta: { keywords: '', description: '', charset: 'utf-8' } })
  }
  {
    let ctx = await router.exec({
      path: '/test/noop',
      method: 'GET'
    })
    expect(ctx.body).to.eql({})
  }
})
