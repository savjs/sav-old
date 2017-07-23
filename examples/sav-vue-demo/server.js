const Koa = require('koa')
const static = require('koa-static')
const path = require('path')

const {Sav, koaPlugin} = require('../../')
const actions = require('./actions')
const contract = require('./contract')
let ssr = require('./server-entry.js')

let app = new Koa()

let sav = new Sav({
  viewRoot: './views',
  auth () {
    console.log("auth-pass")
  }
})

sav.use(koaPlugin)
sav.prepare(Object.assign({actions}, contract))

app.use(static(path.resolve(__dirname, './static/'), {
  index: false
}))

app.use(sav.compose())
app.listen(3000)

sav.on('render', async (opts, next) => {
  let {ctx, renderType, data} = opts
  if (renderType === 'html') {
    next(async () => {
      ssr.render || (ssr.render = ssr.createRenderer(Object.assign({
        template: data.replace('<div id="app"></div>', '')
      }, ssr.renderOptions)))
      let {router, flux} = ssr
      let path = ctx.path || ctx.originalUrl
      router.push(path)
      if (flux) {
        await flux.replaceState(ctx.composeState || {})
      }
      return new Promise((resolve, reject) => {
        ssr.render.renderToString(ssr.vm, (err, html) => {
          if (err) {
            reject(err)
          }
          opts.data = html
          resolve()
        })
      })
    })
  }
})

console.log('server: http://localhost:3000/')
