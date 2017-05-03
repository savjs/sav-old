
export function titlePlugin (sav) {
  let {config} = sav
  let appTitle = config.env('app_title', '')
  let titleKey = config.env('title_key', 'title')
  let titleSep = config.env('title_sep', '')
  sav.use({
    async payload (ctx, next) {
      ctx.prop('setTitle', (title) => {
        if (title) {
          if (titleSep) {
            title = `${title}${titleSep}${appTitle}`
          }
        } else {
          title = appTitle
        }
        ctx.setState({[`${titleKey}`]: title})
      })
      await next()
    },
    route ({props: {title}}) {
      if (title) {
        title.setMiddleware((ctx) => {
          ctx.setTitle(title.props)
        })
      }
    }
  })
}
