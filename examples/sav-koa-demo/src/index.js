const {resolve} = require('path')

const Koa = require('koa')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const staticCache = require('koa-static-cache')

const {Router, plugins, Composer} = require('../../../')
const Action = require('./action')
const Contract = require('./contract')

let port = 3000
let app = new Koa()

if (process.env.NODE_ENV !== 'production') {
  app.use(logger())
}
app.use(staticCache(resolve(__dirname, '../static'), {
  maxAge: 365 * 24 * 60 * 60
}))

app.use(bodyParser())

let router = new Router({
  viewRoot: resolve(__dirname, 'views')
})

router.use(plugins.vuePlugin)
router.use(plugins.titlePlugin)
router.use(plugins.metaPlugin)
router.use(plugins.schemaPlugin)

router.declare(Composer(Contract, Action))

app.use(router.compose())
app.listen(port)
