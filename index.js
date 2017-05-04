import apis from './test/unit/fixtures/implements/api/index.js'
import pages from './test/unit/fixtures/implements/page/index.js'
import layouts from './test/unit/fixtures/implements/layout/index.js'
import {Router} from 'sav/index.js'

import {schemaPlugin, titlePlugin, metaPlugin, authPlugin} from 'sav/plugins'

let router = new Router({
  auth (ctx, access) {
    // pass
  }
})

router.use(schemaPlugin)
router.use(titlePlugin)
router.use(metaPlugin)
router.use(authPlugin)

router.declare([].concat(apis).concat(pages).concat(layouts))

async function testArticleApiComment () {
  let ctx = {
    path: '/api/article/comment/123',
    method: 'POST'
  }
  return router.exec(ctx).then(() => ctx.state)
}

async function testArticlePageList () {
  let ctx = {
    path: '/article/list',
    method: 'GET'
  }
  return router.exec(ctx).then(() => ctx.state)
}

async function testArticlePageView () {
  let ctx = {
    path: '/articles/1002',
    method: 'GET'
  }
  return router.exec(ctx).then(() => ctx.state)
}

Promise.all([
  testArticleApiComment(),
  testArticlePageList(),
  testArticlePageView()
]).then((ret) => {
  console.log('done')
  console.log()
  console.log(JSON.stringify(ret, null, 2))
}).catch (err => {
  console.error(err)
})
