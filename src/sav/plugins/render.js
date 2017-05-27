// 数据渲染层

export function renderPlugin (sav) {
  sav.use({
    name: 'render',
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
    teardown (ctx, next) {
      if (ctx.renderer) {
        next(async () => {
          await ctx.renderer(ctx)
        })
      }
    }
  })
}
