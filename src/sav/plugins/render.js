// 数据渲染层

export function renderPlugin (sav) {
  sav.use({
    setup ({prop, ctx}) {
      prop({
        renderType: null,
        renderData: null,
        setRenderData (renderType, data) {
          ctx.renderType = renderType
          if (data !== undefined) {
            ctx.renderData = data
          }
        },
        setData (data) {
          ctx.renderData = data
        },
        setRaw (data) {
          ctx.setRenderData('raw', data)
        }
      })
    },
    teardown (ctx, promise) {
      if (ctx.renderer) {
        promise.then(async () => {
          await ctx.renderer(ctx)
        })
      }
    }
  })
}
