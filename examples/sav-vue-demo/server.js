const Koa = require('koa')
const static = require('koa-static')

const {Sav, koaPlugin} = require('sav')
const actions = require('./actions')
const contract = require('./contract')
const path = require('path')

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
