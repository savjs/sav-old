import {quickConf} from '../decorator'
import {convertCase} from '../utils/convert'

export const auth = quickConf('auth')

export function authPlugin (sav) {
  let auth = sav.config('auth', async (ctx, access, groups) => {})
  let authCase = sav.config('authCase', 'snake')
  let authJoin = sav.config('authJoin', '-')
  sav.use({
    async payload (ctx, next) {
      ctx.auth = async (access, groups) => {
        await auth(ctx, access, groups)
      }
      await next()
    },
    module (module) {
      let auth = module.props.auth
      if (auth) {
        module.authGroups = authArray(auth)
      }
    },
    action (action) {
      let {module, props} = action
      let auth = props.auth
      if (auth === false) {
        return
      }
      if (auth) { // not undefined
        action.authGroups = authArray(auth)
      } else if (module.authGroups) {
        action.authGroups = module.authGroups
      }
      if (action.authGroups) {
        action.authAccess = convertCase(authCase, module.moduleName) +
          authJoin + convertCase(authCase, action.actionName)
        action.set('auth', async (ctx) => {
          await ctx.auth(action.authAccess, action.authGroups)
        })
      }
    }
  })
}

function authArray (val) {
  return val === true ? [] : (Array.isArray(val) ? val : [val])
}
