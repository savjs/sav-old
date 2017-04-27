
export async function comment (ctx) {
  return ctx.comments = Object.assign({comment: true}, await this.test())
}

export async function test ({sav}) {
  return Object.assign({test: true}, await sav.ArticleApi.test1())
}

export function test1 () {
  return {test1: true}
}
