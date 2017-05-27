// 认证
import {NotImplementedException} from '../core/exception.js'

export function authPlugin (sav) {
  let auth = (ctx, access) => {
    throw new NotImplementedException('Auth is not implemented')
  }
  sav.use({
    name: 'auth',
    setup ({ctx, prop}) {
      prop('auth', async (access) => {
        return sav.config.get('auth', auth)(ctx, access)
      })
    }
  })
}
