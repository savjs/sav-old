
export async function comment ({setState}) {
  return setState(Object.assign({comment: true}, await this.test()))
}

export async function test ({sav, setState}) {
  setState({test: true})
  return sav.ArticleApi.test1()
}

export function test1 () {
  return {test1: true}
}
