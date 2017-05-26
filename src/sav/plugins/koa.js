import {resolve} from 'path'
import {readFileAsync} from '../util/file.js'
import {tmpl} from '../util/tmpl.js'

export function koaPlugin (sav) {
  let {config} = sav
  let defaultRenderType = config.get('defaultRenderType', 'json') // 默认的渲染类型
  let autoRenderType = config.get('autoRenderType', true) // 自动检测类型
  let viewRoot = config.get('viewRoot', 'views')
  let viewTemplate = resolve(viewRoot, config.get('viewTemplate', 'index.html'))
  let composeState = (data, state, error) => {
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
    return Object.assign(ret, data || state)
  }
  let viewFunc
  let renderHtml = async (ctx) => {
    if (!viewFunc) {
      viewFunc = tmpl((await readFileAsync(viewTemplate)).toString())
    }
    console.log(ctx, ctx.renderData, ctx.state)
    let html = viewFunc(makeProxy(config, ctx.renderData || ctx.state))
    if (html.indexOf('<!-- INIT_STATE -->') !== -1) {
      let state = composeState(ctx.renderData, ctx.state, ctx.error)
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

  let renderWith = async (type, ctx) => {
    switch (type) {
      case 'json':
        ctx.body = composeState(ctx.renderData, ctx.state, ctx.error)
        break
      case 'raw':
        ctx.body = ctx.renderData
        break
      case 'html':
        await renderHtml(ctx)
        break
      default:
        break
    }
  }

  let renderer = async (ctx) => {
    let renderType = ctx.renderType || (autoRenderType && ctx.acceptType) || defaultRenderType
    await renderWith(renderType, ctx)
  }

  let accepts = ['json', 'html']

  sav.use({
    setup ({prop, ctx}) {
      prop({
        renderer
      })
      prop.getter('acceptType', () => {
        if (ctx.accept) { // is koa
          let type = ctx.accept.type(['json', 'html'])
          if (accepts.indexOf(type) !== -1) {
            return type
          }
        }
      })
    }
  })
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
