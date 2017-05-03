import {convertRoute} from '../router/convert.js'

let moduleTypes = ['Layout', 'Api', 'Page']

export function routePlugin (sav) {
  let {config} = sav
  sav.use({
    module (module) {
      if (moduleTypes.indexOf(module.moduleGroup) > 0) { // Api 或 Page 类型的需要路由
        // 路由部分可以提前生成, 减少加载编译时间
        if (!module.SavRoute) { // 注入 SavRoute 和 VueRoute
          let routeInfo = convertRoute(module,
            config.get('caseType', 'camel'),
            config.env('prefix', '/'))
          Object.assign(module, routeInfo)
        }
      }
    },
    route ({props: {route}}) {
      if (route) {
        route.setMiddleware(async (ctx) => {
          return ctx.dispatch(ctx.route.uri)
        })
      }
    }
  })
}
