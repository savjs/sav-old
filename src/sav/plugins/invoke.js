// 执行器

export function invokePlugin (sav) {
  let {config} = sav
  let invokeQueues = config.get('invokeQueues', [
    'auth',
    'checkRequest',
    'dispatch',
    'checkResponse'
  ])
  let isInvokeLayout = config.get('invokeLayout', false)
  let invoke = async function (payload) {
    for (let name of this.invokeQueues) {
      await this[name](payload)
    }
  }
  let invokeLayout = async function () {
    let ref = this.uri(this.route.uri)
    let layoutModal
    if (ref.layout) {
      layoutModal = 'Layout' + ref.layout
    }
    if (layoutModal) {
      await this.sav[layoutModal].invoke()
    }
  }
  sav.use({
    name: 'invoke',
    setup ({prop, ctx}) {
      prop({
        invoke,
        invokeLayout: isInvokeLayout,
        invokeQueues: Object.assign([], invokeQueues)
      })
    },
    async payload (ctx, next) {
      if (ctx.invokeLayout) {
        await Promise.all([
          ctx.invoke(),
          invokeLayout.call(ctx)
        ])
      } else {
        await ctx.invoke()
      }
      await next()
    }
  })
}
