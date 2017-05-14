import {NotImplementedException} from '../core/exception.js'

export function authPlugin (sav) {
  let {config} = sav
  let auth = (ctx, access) => {
    throw new NotImplementedException('Auth is not implemented')
  }
  let authDefaultRole = config.env('auth_default_role', 'user')
  sav.use({
    async payload (ctx, next) {
      ctx.auth = async (access) => {
        return config.get('auth', auth)(ctx, access)
      }
      await next()
    },
    module (module) {
      if (module.props.auth) {
        for (let route of module.routes) {
          if (!route.props.auth) {
            route.prependMiddleware({
              name: 'auth',
              props: module.props.auth
            })
          }
        }
      }
    },
    route ({props: {auth}}) {
      if (auth) {
        auth.setMiddleware((ctx) => {
          if (auth.props !== false) {
            return ctx.auth(auth.props || authDefaultRole)
          }
        })
      }
    }
  })
}
