
export class JsonRender {
  render ({ctx, argv, sav}) {
    if (argv.error) {
      let err = sav.stripError(argv.error)
      ctx.status = err.status
      ctx.body = err
    } else {
      ctx.body = argv.output
    }
  }
}
