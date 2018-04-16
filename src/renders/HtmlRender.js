import {readFileSync} from 'fs'
import {resolve} from 'path'
import {tmpl, testAssign} from 'sav-util'

export class HtmlRender {
  constructor (opts) {
    this.opts = testAssign(opts, {
      indexHtmlFile: null,
      indexTemplate: '{%=JSON.stringify(state, null, 2)%}',
      errorHtmlFile: null,
      errorTemplate: '{%=state.error.status%}'
    })
    this.templateMaps = {}
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
  let viewTemplate = error ? opts.indexHtmlFile : opts.errorHtmlFile
  let templateHtml
  if (viewTemplate) {
    templateHtml = readFileSync(resolve(opts.rootPath, viewTemplate)).toString()
  } else {
    templateHtml = error ? opts.errorTemplate : opts.indexTemplate
  }
  let viewFunc = templateMaps[viewTemplate] || (
    templateMaps[viewTemplate] = tmpl(templateHtml))
  return viewFunc
}
