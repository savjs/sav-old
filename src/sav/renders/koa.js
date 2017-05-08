import {resolve} from 'path'
import {readFileAsync} from '../util/file.js'

export function koaRenderer (sav) {
  let {config} = sav
  let viewRoot = config.get('viewRoot', 'views')
  let vueTemplate = resolve(viewRoot, config.get('vueTemplate', 'index.html'))
  let vueFileData
  let composeState = (data, state, error) => {
    if (error) {
      error = error.toJSON()
      if (config.prod) {
        delete error.step
        delete error.stack
        delete error.stacks
      }
    }
    return Object.assign({error}, data || state)
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
          if (!vueFileData) {
            vueFileData = (await readFileAsync(vueTemplate)).toString()
          }
          let html = vueFileData
          if (vueFileData.indexOf('<!-- INIT_STATE -->') !== -1) {
            let state = composeState(data, ctx.state, err)
            let stateText = JSON.stringify(state)
            let stateScript = `
            <script type="text/javascript">
              window.INIT_STATE = ${stateText}
            </script>
            `
            html = vueFileData.replace('<!-- INIT_STATE -->', stateScript)
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
