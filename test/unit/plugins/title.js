import test from 'ava'
import {expect} from 'chai'

import {Router, titlePlugin, title, get, ApiModule} from 'sav/index.js'

function createRouter (config) {
  let router = new Router(config)
  router.use(titlePlugin)
  @ApiModule()
  class Test {
    @get()
    @title('test')
    test () {}

    @get()
    @title()
    app () {}

    @get()
    noop () {}
  }
  router.declare(Test)
  return router
}

test('title', async (ava) => {
  let router = createRouter()
  {
    let ctx = await router.exec({
      path: '/test/test',
      method: 'GET'
    })
    expect(ctx.body).to.eql({title: 'test'})
  }
  {
    let ctx = await router.exec({
      path: '/test/noop',
      method: 'GET'
    })
    expect(ctx.body).to.eql({})
  }
  {
    let ctx = await router.exec({
      path: '/test/app',
      method: 'GET'
    })
    expect(ctx.body).to.eql({title: ''})
  }
})

test('title config', async (ava) => {
  let router = createRouter({
    app_title: 'app',
    title_sep: '-'
  })
  {
    let ctx = await router.exec({
      path: '/test/test',
      method: 'GET'
    })
    expect(ctx.body).to.eql({title: 'test-app'})
  }
})
