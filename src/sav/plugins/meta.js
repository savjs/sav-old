
export function metaPlugin (sav) {
  let {config} = sav
  let metaKey = config.env('meta_key', 'meta')
  let keywords = config.env('meta_keywords', '')
  let description = config.env('meta_description', '')
  sav.use({
    async payload (ctx, next) {
      ctx.prop('setMeta', (metaData) => {
        ctx.setState({[`${metaKey}`]: {
          keywords,
          description,
          ...metaData
        }})
      })
      await next()
    },
    route ({props: {meta}}) {
      meta && meta.setMiddleware((ctx) => {
        ctx.setMeta({[`${metaKey}`]: meta.props})
      })
    }
  })
}
