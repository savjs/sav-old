// 路由中间件

import {convertRouters} from '../router/convert.js'
import {matchModulesRoute} from '../router/match.js'
import {NotRoutedException} from '../core/exception.js'

export function routerPlugin (sav) {
  sav.use({
    prepare (payload) {
      let {routes} = convertRouters(payload)
      sav.matchRoute = (ctx) => {
        let method = ctx.method.toUpperCase()
        let path = ctx.path || ctx.originalUrl
        let matched = matchModulesRoute(routes, path, method)
        if (matched) {
          matched = JSON.parse(JSON.stringify(matched))
          let [route, params] = matched
          ctx.route = route
          ctx.params = params
        }
        return matched
      }
    },
    setup ({ctx}) {
      let exp
      try {
        exp = !sav.matchRoute(ctx)
      } catch (err) {
        throw new NotRoutedException(err)
      }
      if (exp) {
        throw new NotRoutedException('NotRouted')
      }
    }
  })
}
