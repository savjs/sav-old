import test from 'ava'
import {expect} from 'chai'

import {viewPlugin, view, Router, get, gen, props} from 'sav-core'

test('render.template', async (ava) => {
  @gen
  @props({
    view: 'fixtures'
  })
  class Test {
    @get()
    async basic (ctx) {
      ctx.state = {
        title: 'User List',
        users: [{name: 'Alice'}, {name: 'George'}]
      }
    }

    @view('basic.hbs')
    @get()
    async hbs (ctx) {
      ctx.state = {
        title: 'hbs'
      }
    }
  }

  let router = new Router({
    viewRoot: __dirname,
    viewEngines: {
      hbs: 'handlebars'
    }
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx

  ctx = {
    path: '/Test/basic',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body.indexOf('User List')).to.not.eql(-1)

  ctx = {
    path: '/Test/hbs',
    method: 'GET'
  }
  await router.route()(ctx)

  expect(ctx.body.indexOf('hbs')).to.not.eql(-1)
})

test('render.nofount', async (ava) => {
  @gen
  @props({
    view: 'fixtures'
  })
  class Test {
    @get()
    async nofound () {}

    @get()
    async nofound2 (ctx) {
      ctx.state = {}
      ctx.view('fixtures/nofound')
    }

    @view('basic')
    @get()
    async noObjectBody (ctx) {
      ctx.state = '123'
    }

    @get()
    async noEngine (ctx) {
      ctx.state = {}
      ctx.view('fixtures/basic.hbs')
    }
  }

  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/nofound',
    method: 'GET'
  }
  let err
  await router.route()(ctx).catch((e) => {
    err = e
  })
  expect(err).to.not.eql(undefined)
  err = undefined

  expect(ctx.body).to.eql(undefined)

  ctx = {
    path: '/Test/noObjectBody',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body).to.not.eql('123')

  ctx = {
    path: '/Test/nofound2',
    method: 'GET'
  }
  await router.route()(ctx).catch((e) => {
    err = e
  })
  expect(err).to.not.eql(undefined)
  err = undefined
  expect(ctx.body).to.eql(undefined)

  ctx = {
    path: '/Test/noEngine',
    method: 'GET'
  }
  await router.route()(ctx).catch((e) => {
    err = e
  })
  expect(err).to.not.eql(undefined)
  err = undefined
})

test('render.render', async (ava) => {
  @gen
  @props({
    view: 'fixtures'
  })
  class Test {
    @get()
    async test (ctx) {
      ctx.state = {
        title: 'User List',
        users: [{name: 'Alice'}, {name: 'George'}]
      }
      ctx.view('fixtures/basic')
    }
  }

  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/test',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body.indexOf('User List')).to.not.eql(-1)
})

test('render.layout', async (ava) => {
  @gen
  @props({
    viewFile: 'fixtures/basic'
  })
  class Test {
    @get()
    async test (ctx) {
      ctx.state = {
        title: 'User List',
        users: [{name: 'Alice'}, {name: 'George'}]
      }
    }

    @get()
    async test2 (ctx) {
      ctx.state = {
        title: 'Users',
        users: []
      }
    }
  }

  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/test',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body.indexOf('User List')).to.not.eql(-1)

  ctx = {
    path: '/Test/test2',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body.indexOf('Users')).to.not.eql(-1)
})

test('render.layout.default', async (ava) => {
  @gen
  @props({
    view: 'fixtures/basic',
    viewFile: true
  })
  class Test {
    @get()
    async test (ctx) {
      ctx.state = {
        title: 'User List',
        users: [{name: 'Alice'}, {name: 'George'}]
      }
    }
  }

  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/test',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body.indexOf('User List')).to.not.eql(-1)
})

test('render.layout.default.nofound', async (ava) => {
  @gen
  @props({
    viewFile: true
  })
  class Test {
    @get()
    async test (ctx) {
      ctx.state = {title: 'User List'}
    }
  }

  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  let ctx
  ctx = {
    path: '/Test/test',
    method: 'GET'
  }
  let err
  await router.route()(ctx).catch((e) => {
    err = e
  })
  expect(err).to.not.eql(undefined)
  err = undefined
  expect(ctx.body).to.eql(undefined)
})

test('render no view module', async (ava) => {
  @gen
  class Test {
    @get()
    async test (ctx) {
      ctx.state = {title: 'User List'}
    }
  }
  let router = new Router({
    viewRoot: __dirname
  })
  router.use(viewPlugin)
  router.declare(Test)
  let ctx
  ctx = {
    path: '/Test/test',
    method: 'GET'
  }
  await router.route()(ctx)
  expect(ctx.body).to.eql(undefined)
})
