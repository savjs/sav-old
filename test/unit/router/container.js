import test from 'ava'
import {expect} from 'chai'

import {Router, get, gen} from 'sav-core'

test('container.path', ava => {
  let router = new Router()
  @gen
  class Test {
    @get() path1 () {}
    @get(':path2') path2 () {}
    @get('/path3') path3 () {}
    @get('~path4') path4 () {}
  }
  router.declare(Test)
  expect(router.matchRoute('/Test/path1', 'GET')).to.be.a('array')
  expect(router.matchRoute('/Test/path', 'GET')).to.be.a('array')
  expect(router.matchRoute('/path3', 'GET')).to.be.a('array')
  expect(router.matchRoute('/path4', 'GET')).to.be.a('array')
})

test('container.prefix', ava => {
  let router = new Router({
    prefix: '/api/v3/'
  })
  @gen
  class Test {
    @get() path1 () {}
    @get(':path2') path2 () {}
    @get('/path3') path3 () {}
    @get('~path4') path4 () {}
  }
  router.declare(Test)

  expect(router.matchRoute('/api/v3/Test/path1', 'GET')).to.be.a('array')
  expect(router.matchRoute('/api/v3/Test/path', 'GET')).to.be.a('array')
  expect(router.matchRoute('/path3', 'GET')).to.be.a('array')
  expect(router.matchRoute('/api/v3/path4', 'GET')).to.be.a('array')
})

test('container.case', ava => {
  let router = new Router({
    case: 'camel'
  })
  @gen
  class Test {
    @get() path () {}
  }
  router.declare(Test)

  expect(router.matchRoute('/test/path', 'GET')).to.be.a('array')
})
