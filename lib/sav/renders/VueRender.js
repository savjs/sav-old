import {readFileSync} from 'fs'
import {resolve} from 'path'

export class VueRender {
  constructor (sav) {
    this.opts = {
      serverTemplate: './views/index.html',
      serverEntry: './server-entry.js'
    }
    sav.shareOptions(this)
    this.require = require
  }
  render ({ctx, argv, sav}) {
    let {vm, router, flux, render} = this.getRender()
    let path = ctx.path || ctx.originalUrl
    router.push(path)
    if (flux) {
      flux.replaceState(argv.state)
    }
    return new Promise((resolve, reject) => {
      render.renderToString(vm, (err, html) => {
        if (err) {
          return reject(err)
        }
        html = html.replace('data-server-rendered="true"', '')
        ctx.body = html
        resolve()
      })
    })
  }
  getRender () {
    if (!this.ssr) {
      let {opts} = this
      let entryFile = resolve(opts.rootPath, opts.serverEntry)
      let {vm, router, flux, createRenderer, renderOptions} = this.serverEntry = this.require(entryFile)
      let template = readFileSync(resolve(opts.rootPath, opts.serverTemplate)).toString()
      let render = createRenderer(Object.assign({template}, renderOptions))
      this.ssr = {
        router,
        flux,
        render,
        vm
      }
    }
    return this.ssr
  }
}
