import {quickConf} from '../decorator'
import {convertCase} from '../utils/convert'

export const auth = quickConf('auth')

export function authPlugin (sav) {
  let auth = sav.config('auth', async (ctx, access) => {})
  let authCase = sav.config('authCase', 'snake')
  let authJoin = sav.config('authJoin', '-')
  sav.use({
    async payload (ctx, next) {
      ctx.auth = async (access) => {
        await auth(ctx, access)
      }
      await next()
    },
    module (module) {
      let auth = module.props.auth
      if (auth) {
        module.auth = !!auth
      }
    },
    action (action) {
      let {module, props: {auth}} = action
      if (auth) {
        if (auth[0] === false) {
          return
        }
        action.auth = true
      } else if (module.auth) {
        action.auth = module.auth
      }
      if (action.auth) {
        action.authAccess = convertCase(authCase, module.moduleName) +
          authJoin + convertCase(authCase, action.actionName)
        action.set('auth', async (ctx) => {
          await ctx.auth(action.authAccess)
        })
      }
    }
  })
}
