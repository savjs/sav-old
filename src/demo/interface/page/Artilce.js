
@defPage()
export default class Article {
  @get()
  list() {}

  @get('article/:aid')
  view() {}

  @get('modify/:aid')
  @auth()
  modify() {}

  @post('update/:aid')
  @auth()
  update() {}
}
