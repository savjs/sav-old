import {resolve} from 'path'
import {readFileAsync} from '../util/file.js'
import {tmpl} from '../util/tmpl.js'
import {next as promiseNext} from 'sav-util'

export function koaPlugin (sav) {
  let {config} = sav
  let defaultRenderType = config.get('defaultRenderType', 'json') // 默认的渲染类型
  let autoRenderType = config.get('autoRenderType', true) // 自动检测类型
  let viewRoot = config.get('viewRoot', 'views')
  let viewTemplate = resolve(viewRoot, config.get('viewTemplate', 'index.html'))
  let renders = {
    json (ctx) {
      return composeState(ctx.renderData || ctx.state, ctx.error, config)
    },
    raw (ctx) {
      return ctx.renderData
    },
    html (ctx) {
      return renderTmpl(viewTemplate, ctx, config)
    }
  }
  let renderer = async (ctx) => {
    let renderType = ctx.renderType || (autoRenderType && ctx.acceptType) || defaultRenderType
    if (renders[renderType]) {
      let data = await renders[renderType](ctx)
      let dataCtx = {
        ctx,
        renderType, 
        data
      }
      let next = promiseNext()
      try {
        sav.emit('render', dataCtx, next)
      } catch (err) {
        next(() => { throw err })
      }
      return next().then(() => {
        ctx.body = dataCtx.data
      })
    }
    // return new Error('404')
  }
  sav.use({
    name: 'koa',
    setup ({prop, ctx}) {
      prop({
        renderer,
        inputData: Object.assign({}, ctx.query, ctx.request && ctx.request.body, ctx.params)
      })
      makeAcceptType(ctx)
    }
  })
}

const tmpMaps = {}

async function renderTmpl (viewTemplate, ctx, config) {
  let viewFunc = tmpMaps[viewTemplate] || (
    tmpMaps[viewTemplate] = tmpl((await readFileAsync(viewTemplate)).toString())
  )
  let renderState = makeProxy(config, ctx.renderData || ctx.state)
  let state = ctx.composeState = composeState(ctx.renderData || ctx.state, ctx.error, config)
  let html = viewFunc(renderState)
  if (html.indexOf('<!-- INIT_STATE -->') !== -1) {
    let stateText = JSON.stringify(state)
    let stateScript = `
    <script type="text/javascript">
      window.INIT_STATE = ${stateText}
    </script>
    `
    html = html.replace('<!-- INIT_STATE -->', stateScript)
  }
  return html
}

const accepts = ['json', 'html']

function makeAcceptType ({prop, ctx}) {
  prop.getter('acceptType', () => {
    if (ctx.accept) { // is koa
      let type = ctx.accept.type(['json', 'html'])
      if (accepts.indexOf(type) !== -1) {
        return type
      }
    }
  })
}

function composeState (data, error, config) {
  let ret = {}
  if (error) {
    error = error.toJSON()
    if (config.prod) {
      delete error.step
      delete error.stack
      delete error.stacks
    }
    ret.error = error
  }
  return Object.assign(ret, data)
}

function makeProxy (config, state) {
  return new Proxy({}, {
    get (target, name) {
      if (name in state) {
        return state[name]
      }
      return config.get(name, '')
    }
  })
}
