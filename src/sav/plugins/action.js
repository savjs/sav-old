// 注入模块方法

import {proxyModuleActions} from '../router/proxy.js'

export function actionPlugin (sav) {
  sav.use({
    prepare ({actions}) {
      if (actions) {
        sav.actions = actions
      }
    },
    setup ({ctx}) {
      if (sav.actions) {
        ctx.prop('sav', proxyModuleActions(ctx, sav.actions))
      }
    }
  })
}
