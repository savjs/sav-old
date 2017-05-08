const {PageInterface, post, get, auth, vue, req, res, meta, title} = SavDecorators

@PageInterface({
  view: 'vue',
  layout: 'UserLayout',
  route: {
    path: '',
  }
})
export default class Home {
  @get('')
  @title('主页')
  @meta({
    keywords: '关键字列表',
    description: '页面描述',
  })
  index () {}

  @get()
  @title('关于我们')
  about () {}
}
