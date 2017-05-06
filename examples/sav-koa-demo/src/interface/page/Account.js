const {PageInterface, get, post, auth, vue, req, res, meta, title} = SavDecorators

@PageInterface({
  view: 'vue',
  layout: 'UserLayout'
})
export default class Account {
  @get()
  @title('登录')
  login() {}

  @post()
  @req({
    props: {
      username: 'String',
      password: 'String'
    }
  })
  @title('登录')
  @vue({component: 'Account/AccountLogin'})
  postLogin() {}

  @res({
    name: 'AccountRegister',
    props: {
      username: 'String',
      email: 'String',
      password: 'String'
    }
  })
  @get()
  @title('注册')
  register() {}

  @res('AccountRegister')
  @post()
  @req({
    props: {
      username: 'String',
      email: 'String',
      password: 'String'
    }
  })
  @title('注册')
  @vue({component: 'Account/AccountRegister'})
  postRegister() {}

}
