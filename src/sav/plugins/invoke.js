// 执行器

export function invokePlugin (sav) {
  let {config} = sav
  let invokeQueues = config.get('invokeQueues', [
    'auth',
    'checkRequest',
    'dispatch',
    'checkResponse'
  ])
  let invoke = async function (payload) {
    for (let name of this.invokeQueues) {
      await this[name](payload)
    }
  }
  sav.use({
    name: 'invoke',
    setup ({prop, ctx}) {
      prop({
        invoke,
        invokeQueues: Object.assign([], invokeQueues)
      })
    },
    async payload (ctx, next) {
      await ctx.invoke()
      await next()
    }
  })
}
