// 注入模块方法

import {proxyModuleActions} from '../router/proxy.js'

export function actionPlugin (sav) {
  sav.use({
    prepare ({actions}) {
      sav.actions = actions
    },
    setup (ctx) {
      ctx.prop('sav', proxyModuleActions(ctx, sav.actions))
    }
  })
}
