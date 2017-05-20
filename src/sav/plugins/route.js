// import {makeSavRoute} from '../middlewares/sav.js'

export function routePlugin (sav) {
  sav.use({
    route ({props: {route}}) {
      if (route) {
        route.setMiddleware((ctx) => {
          return ctx.dispatch(ctx.route.uri)
        })
      }
    }
  })
}
