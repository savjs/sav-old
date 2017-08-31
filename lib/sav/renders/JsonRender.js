
export class JsonRender {
  render ({ctx, argv, sav}) {
    if (argv.error) {
      let error = sav.stripError(argv.error)
      ctx.status = error.status
      ctx.body = {error}
    } else {
      ctx.body = argv.output
    }
  }
}
