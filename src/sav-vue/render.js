
export function vueRender (options) {
  return async (context) => {
    await context.vueRenderer(context)
  }
}
