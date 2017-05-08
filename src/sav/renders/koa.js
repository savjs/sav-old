import {resolve} from 'path'
import {readFileAsync} from '../util/file.js'
import {tmpl} from '../util/tmpl.js'

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

export function koaRenderer (sav) {
  let {config} = sav
  let viewRoot = config.get('viewRoot', 'views')
  let vueTemplate = resolve(viewRoot, config.get('vueTemplate', 'index.html'))
  let vueFunc
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
  sav.setRender({
    async json (ctx, data, err) {
      ctx.body = composeState(data, ctx.state, err)
    },
    async vue (ctx, data, err) {
      if (ctx.isHtml) {
        if (config.get('vue_server_render') && ctx.getRender('ssr')) {
          return await sav.render(ctx, 'ssr', data, err)
        } else {
          if (!vueFunc) {
            vueFunc = tmpl((await readFileAsync(vueTemplate)).toString())
          }
          let html = vueFunc(makeProxy(config, ctx.state))
          if (html.indexOf('<!-- INIT_STATE -->') !== -1) {
            let state = composeState(data, ctx.state, err)
            let stateText = JSON.stringify(state)
            let stateScript = `
            <script type="text/javascript">
              window.INIT_STATE = ${stateText}
            </script>
            `
            html = html.replace('<!-- INIT_STATE -->', stateScript)
          }
          ctx.body = html
          return
        }
      }
      return await sav.render(ctx, 'json', data, err)
    },
    async view (ctx, data, err) {

    }
  })
}
