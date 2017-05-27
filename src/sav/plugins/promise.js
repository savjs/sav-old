// Promise中间件

import {promise} from '../util'

export function promisePlugin (sav) {
  sav.use({
    name: 'promise',
    setup ({prop}) {
      prop(promise)
    }
  })
}
