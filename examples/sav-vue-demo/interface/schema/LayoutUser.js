
exports.ResUserNavMenu = {
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

exports.ResUserUserInfo = {
  props: {
    userInfo: 'UserInfo'
  },
  refs: {
    Role: {
      name: 'Role',
      default: 'guest',
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
