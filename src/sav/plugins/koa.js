import {resolve} from 'path'
import {readFileAsync} from '../util/file.js'
import {tmpl} from '../util/tmpl.js'

export function koaPlugin (sav) {
  let {config} = sav
  let defaultRenderType = config.get('defaultRenderType', 'json') // 默认的渲染类型
  let autoRenderType = config.get('autoRenderType', true) // 自动检测类型
  let viewRoot = config.get('viewRoot', 'views')
  let viewTemplate = resolve(viewRoot, config.get('viewTemplate', 'index.html'))
  let renders = {
    json (ctx) {
      ctx.body = composeState(ctx.renderData || ctx.state, ctx.error, config)
    },
    raw (ctx) {
      ctx.body = ctx.renderData
    },
    html (ctx) {
      return renderTmpl(viewTemplate, ctx, config)
    }
  }
  let renderer = async (ctx) => {
    let renderType = ctx.renderType || (autoRenderType && ctx.acceptType) || defaultRenderType
    if (renders[renderType]) {
      await renders[renderType](ctx)
    }
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
  let state = makeProxy(config, ctx.renderData || ctx.state)
  let html = viewFunc(state)
  if (html.indexOf('<!-- INIT_STATE -->') !== -1) {
    let state = composeState(ctx.renderData || ctx.state, ctx.error, config)
    let stateText = JSON.stringify(state)
    let stateScript = `
    <script type="text/javascript">
      window.INIT_STATE = ${stateText}
    </script>
    `
    html = html.replace('<!-- INIT_STATE -->', stateScript)
  }
  ctx.body = html
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
