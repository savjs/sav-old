import test from 'ava'
import {expect} from 'chai'

import {auth, authPlugin, get, Router, gen, props} from 'sav-core'

test('api', (ava) => {
  expect(auth).to.be.a('function')
  expect(authPlugin).to.be.a('function')
})

function createAuthApp () {
  @gen
  @props({
    auth: true
  })
  class Test {
    @get()
    async user (ctx) {
      ctx.state = {
        title: 'User'
      }
    }
    @get()
    async admin (ctx) {
      ctx.state = {
        title: 'Admin'
      }
    }
    @get()
    @auth(false)
    async guest (ctx) {
      ctx.state = {
        title: 'guest'
      }
    }
    @get()
    async logined (ctx) {
      ctx.state = {
        title: 'logined'
      }
    }
  }
  let groupAccess = {
    user: ['test-user', 'test-logined'],
    admin: ['test-user', 'test-admin', 'test-logined']
  }
  let router = new Router({
    auth: async (ctx, access) => {
      if (!ctx.userRole) {
        throw new Error('ERR_AUTH_NO_USER 不能识别用户身份')
      }
      if (!(ctx.userRole in groupAccess)) {
        throw new Error('ERR_AUTH_OUTOF_GROUP 不能识别的用户组')
      }
      if (!~groupAccess[ctx.userRole].indexOf(access)) {
        throw new Error('ERR_AUTH_NO_GROUP_ACCESS 用户组无访问权限')
      }
    }
  })
  router.use(authPlugin)
  router.declare(Test)
  return {
    router,
    groupAccess
  }
}

test('auth.guest', async (ava) => {
  let {router} = createAuthApp()
  let ctx = {
    path: '/Test/guest',
    method: 'GET'
  }
  await router.route()(ctx)
})

test('auth.user', async (ava) => {
  let {router} = createAuthApp()
  let ctx = {
    path: '/Test/user',
    method: 'GET',
    userRole: 'user'
  }
  await router.route()(ctx)
})

test('auth.admin', async (ava) => {
  let {router} = createAuthApp()
  let ctx = {
    path: '/Test/admin',
    method: 'GET',
    userRole: 'admin'
  }
  await router.route()(ctx)
})

test('auth.logined', async (ava) => {
  let {router} = createAuthApp()
  {
    let ctx = {
      path: '/Test/logined',
      method: 'GET',
      userRole: 'admin'
    }
    await router.route()(ctx)
  }
  {
    let ctx = {
      path: '/Test/logined',
      method: 'GET',
      userRole: 'user'
    }
    await router.route()(ctx)
  }
})

test('cross user and admin', async (ava) => {
  let {router} = createAuthApp()
  {
    let ctx = {
      path: '/Test/user',
      method: 'GET',
      userRole: 'admin'
    }
    await router.route()(ctx)
  }
  {
    let ctx = {
      path: '/Test/admin',
      method: 'GET',
      userRole: 'user'
    }
    let err
    try {
      await router.exec(ctx)
    } catch (e) {
      err = e
    }
    expect(err).to.be.a('Error')
  }
})
