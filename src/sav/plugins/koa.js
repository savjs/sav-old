import {ucfirst} from '../util/convert.js'

export function koaPlugin (sav) {
  sav.use({
    async payload (ctx, next) {
      if (ctx.isKoa) {
        ctx.isHttp = !!(ctx.accept)
        if (ctx.isHttp) {
          let accepts = sav.config.get('accepts', ['json', 'html'])
          let type = ctx.accept.type(accepts)
          if (type && (type !== '*')) {
            ctx.acceptType = type
            type = ucfirst(type)
            ctx[`is${type}`] = true
          }
          ctx.isAjax = ctx.request.get('X-Requested-With') === 'XMLHttpRequest'
        }
      }
      await next()
    }
  })
}
