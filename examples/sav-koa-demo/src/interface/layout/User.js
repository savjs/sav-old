const {LayoutInterface, invoke, res} = SavDecorators

@LayoutInterface()
export default class User {

  @res({
    props: {
      copyright: 'String'
    }
  })
  @invoke()
  copyRight () {}

  @res({
    props: {
      userInfo: 'UserInfo'
    },
    refs: {
      Role: {
        name: 'Role',
        enums: [
          {key: 'user', value: 'user'},
          {key: 'guest', value: 'guest'},
          {key: 'admin', value: 'admin'}
        ]
      },
      UserInfo: {
        props: {
          name: 'String',
          id: 'Number',
          role: 'Role',
        }
      }
    }
  })
  @invoke()
  userInfo () {}

  @res({
    props: {
      menus: 'Array<NavMenuItem>'
    },
    refs: {
      NavMenuItem: {
        props: {
          title: 'String',
          url: 'String'
        }
      }
    }
  })
  @invoke()
  userNavMenu () {}
}
