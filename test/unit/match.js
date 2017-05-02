import test from 'ava'
import {expect} from 'chai'
import {Router} from 'sav/index.js'

import apis from './fixtures/implements/api/index.js'
import pages from './fixtures/implements/page/index.js'
// import layouts from './fixtures/implements/layout/index.js'

test('match.apis', (ava) => {
  let router = new Router()
  router.declare(apis)
  expect(router.matchRoute('/api/article/comment/123', 'POST')).to.be.a('array')
})

test('match.pages', (ava) => {
  let router = new Router()
  router.declare(pages)
  expect(router.matchRoute('/article/comment/123', 'POST')).to.be.a('array')
})

test('match.apis', async (ava) => {
  let router = new Router()
  router.declare(apis)
  let ctx = {
    path: '/api/article/comment/123',
    method: 'POST'
  }
  router.payload(ctx)
  await ctx.sav.ArticleApi.comment()
  console.log(ctx.comments)
})
