// 认证
import {NotImplementedException} from '../core/exception.js'

export function authPlugin (sav) {
  let authError = (ctx, access) => {
    throw new NotImplementedException('Auth is not implemented')
  }
  let auth = sav.config.get('auth', authError)
  sav.use({
    name: 'auth',
    setup ({ctx, prop}) {
      prop('auth', async (uri) => {
        let ref = ctx.uri(uri || ctx.route.uri)
        return auth(ctx, ref.auth)
      })
    }
  })
}
