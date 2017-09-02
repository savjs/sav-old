import {readFileSync} from 'fs'
import {resolve} from 'path'
import {tmpl} from '../utils/tmpl.js'

export class HtmlRender {
  constructor (sav) {
    this.opts = {
      templatePath: './',
      indexTemplate: './index.html',
      errorTemplate: './error.html'
    }
    this.templateMaps = {}
    sav.shareOptions(this)
  }
  render ({ctx, argv: {error, state}, sav}) {
    let viewFunc = getTemplate(this, error)
    let html = viewFunc(state)
    if (error) {
      ctx.status = (typeof error === 'object' && error.status) || 500
    }
    ctx.body = html
  }
}

function getTemplate ({templateMaps, opts}, error) {
  let viewTemplate = error ? opts.errorTemplate : opts.indexTemplate
  let viewFunc = templateMaps[viewTemplate] || (
    templateMaps[viewTemplate] = tmpl((
      readFileSync(resolve(opts.rootPath, opts.templatePath, viewTemplate)
    ).toString())
  ))
  return viewFunc
}
