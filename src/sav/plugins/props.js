// 注入插件

import {makeProp, delProps} from '../util'

export function propsPlugin (sav) {
  sav.use({
    setup ({ctx}) {
      makeProp(ctx)
    },
    shutdown ({ctx}) {
      delProps(ctx)
    }
  })
}
