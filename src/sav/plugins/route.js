import {makeSavRoute} from '../middlewares/sav.js'

let moduleTypes = ['Layout', 'Api', 'Page']

export function routePlugin (sav) {
  sav.use({
    module (module) {
      if (moduleTypes.indexOf(module.moduleGroup) > 0) { // Api 或 Page 类型的需要路由
        // 路由部分可以提前生成, 减少加载编译时间
        if (!module.SavRoute) { // 注入 SavRoute 和 VueRoute
          makeSavRoute(module)
        }
      }
    },
    route ({props: {route}}) {
      if (route) {
        route.setMiddleware((ctx) => {
          return ctx.dispatch(ctx.route.uri)
        })
      }
    }
  })
}
