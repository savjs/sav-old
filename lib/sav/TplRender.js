import {tmpl} from './tmpl.js'

export class TplRender {
  constructor (opts) {
    this.opts = {
      templateFile: 'index.html'
    }
    opts && this.setOptions(opts)
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  render (ctx, {error, data, headers, cookies}) {
    tmpl()
  }
}
