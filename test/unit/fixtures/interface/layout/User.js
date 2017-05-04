import {LayoutInterface, invoke, res} from 'sav/decorator'

@LayoutInterface()
export default class User {

  @res('ResCopyRight')
  @invoke()
  copyRight () {}

  @res({
    name: 'ResUserInfo',
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
    name: 'ResNavMenu',
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
