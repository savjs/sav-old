import {Modal, get} from 'sav'

@Modal()
export default class User {
  @get({
    response: {
      props: {
        copyright: 'String'
      }
    }
  })
  copyRight () {}

  @get({
    response: {
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
    }
  })
  userInfo () {}

  @get({
    response: {
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
    }
  })
  userNavMenu () {}
}
