// 注入插件

import {delProps} from '../util'

export function propsPlugin (sav) {
  sav.use({
    teardown (ctx, next) {
      next(() => {
        delProps(ctx)
      })
    }
  })
}
