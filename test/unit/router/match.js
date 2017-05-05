import test from 'ava'
import {expect} from 'chai'
import {Router, matchContextRoute} from 'sav/index.js'

import apis from '../fixtures/implements/api/index.js'
import pages from '../fixtures/implements/page/index.js'
// import layouts from './fixtures/implements/layout/index.js'

test('match.apis', (ava) => {
  let router = new Router()
  router.declare(apis)
  expect(matchContextRoute({
    path: '/api/article/comment/123',
    method: 'POST'
  }, router)).to.be.a('array')
})

test('match.pages', (ava) => {
  let router = new Router()
  router.declare(pages)
  expect(matchContextRoute({
    path: '/article/comment/123',
    method: 'POST'
  }, router)).to.be.a('array')

  expect(matchContextRoute({
    path: '/articles/123',
    method: 'GET'
  }, router)).to.be.a('array')
})
