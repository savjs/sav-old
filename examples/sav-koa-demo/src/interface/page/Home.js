const {PageInterface, post, get, auth, vue, req, res, meta, title} = SavDecorators

@PageInterface({
  view: 'vue',
  layout: 'UserLayout',
  route: {
    path: '',
  }
})
export default class Home {
  @get('~')
  index () {}

  @get('about')
  about () {}
}
