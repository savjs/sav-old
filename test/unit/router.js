import test from 'ava'
import {expect} from 'chai'
import {stripPrefix, Router} from 'sav'

test('api', async (ava) => {
  expect(stripPrefix).to.be.a('function')
  expect(Router).to.be.a('function')
})

test('stripPrefix', async (ava) => {
  expect(stripPrefix('', '')).to.eql('')
  expect(stripPrefix('/', '')).to.eql('/')
  expect(stripPrefix('/a', '/a')).to.eql('/')
  expect(stripPrefix('/a/', '/a')).to.eql('/')
  expect(stripPrefix('/a/b', '/a')).to.eql('/b')

  expect(stripPrefix('/a/', '/a/')).to.eql('/')
  expect(stripPrefix('/a/b', '/a/')).to.eql('/b')
})

test('router', async (ava) => {
  let router = new Router({
    prefix: '',
    caseType: 'camel',
    sensitive: true
  })
  router.declare({
    Home: {
      routes: {
        default: {
        },
        relative: {
          path: 'relativeRoute'
        },
        absolute: {
          path: '/absoluteRoute'
        },
        user: {
          path: 'user/:id'
        }
      }
    },
    Article: {
      path: 'art',
      prefix: 'admin',
      routes: {
        list: {},
        cat: {
          path: '/article/cat/:id'
        },
        item: {
          path: 'item/:id'
        }
      }
    }
  })
  let pathEqual = (path, end) => {
    let ret = router.matchRoute(path, 'GET')
    expect(ret).to.be.a('object')
    expect(ret.route).to.be.a('object')
    if (typeof end === 'string') {
      expect(ret.route.path).to.eql(end)
    } else {
      expect(end ? (ret.route.path + '/') : ret.route.path).to.eql(path)
    }
  }
  pathEqual('/home/default')
  pathEqual('/home/default/', true)
  pathEqual('/home/relativeRoute')
  pathEqual('/home/relativeRoute/', true)
  pathEqual('/absoluteRoute')
  pathEqual('/absoluteRoute/', true)
  pathEqual('/home/user/1', '/home/user/:id')
  pathEqual('/home/user/1/', '/home/user/:id')

  expect(router.matchRoute('/Home/default', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/something', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/anything', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/home/default')).to.eql(undefined)

  pathEqual('/admin/art/list')
  pathEqual('/admin/art/list/', true)
  pathEqual('/admin/art/item/1', '/admin/art/item/:id')
  pathEqual('/admin/art/item/1/', '/admin/art/item/:id')
  pathEqual('/article/cat/1', '/article/cat/:id')
  pathEqual('/article/cat/1/', '/article/cat/:id')
})

test('router.prefix', async (ava) => {
  let router = new Router({prefix: 'admin'})
  router.declare({
    User: {
      path: 'user',
      prefix: 'project',
      routes: {
        list: {},
        article: {
          path: '/article/cat'
        },
        item: {
          path: 'itemx'
        }
      }
    }
  })
  let pathEqual = (path, end) => {
    let ret = router.matchRoute(path, 'GET')
    expect(ret).to.be.a('object')
    expect(ret.route).to.be.a('object')
    expect(ret.route.path).to.eql(end)
  }
  pathEqual('/admin/project/user/list', '/project/user/list')
  pathEqual('/admin/project/user/list/', '/project/user/list')
  pathEqual('/admin/project/user/itemx', '/project/user/itemx')
  pathEqual('/admin/project/user/itemx/', '/project/user/itemx')
  pathEqual('/admin/article/cat', '/article/cat')
  pathEqual('/admin/article/cat/', '/article/cat')
})

test('router.caseType.sensitive', async (ava) => {
  let router = new Router({caseType: 'hyphen', sensitive: false})
  router.declare({
    UserProfile: {
      routes: {
        HomeInfo: {},
        UserAddress: {
          path: 'UserAddress'
        }
      }
    }
  })
  expect(router.matchRoute('/user-profile/home-info', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-PROFILE/HOME-info/', 'GET')).to.be.a('object')
  expect(router.matchRoute('/user-profile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/home-info', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/UserProfile/HomeInfo', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/user-profile/UserAddress', 'GET')).to.be.a('object')
})

test('router.removeModal', async (ava) => {
  let router = new Router()
  router.declare({
    Home: {
      routes: {
        about: {},
        users: {
          path: '/users'
        }
      }
    }
  })
  expect(router.matchRoute('/home/about', 'GET')).to.be.a('object')
  expect(router.matchRoute('/users', 'GET')).to.be.a('object')
  router.declare({
    Home: {
      routes: {}
    }
  })
  expect(router.modals.Home).to.be.a('object')
  expect(router.matchRoute('/home/about', 'GET')).to.eql(undefined)
  expect(router.matchRoute('/users', 'GET')).to.eql(undefined)
  router.removeModal('Home')
  expect(router.modals.Home).to.eql(undefined)
})

test('router.query', async (ava) => {
  let router = new Router()
  router.declare({
    Home: {
      routes: {
        about: {},
        users: {
          path: '/users'
        }
      }
    }
  })
  {
    let mat = router.matchRoute('/home/about', 'GET')
    expect(mat).to.be.a('object')
    expect(mat.query).to.eql({})
  }
  {
    let mat = router.matchRoute('/home/about?a=b&c=d', 'GET')
    expect(mat).to.be.a('object')
    expect(mat.query).to.eql({a: 'b', c: 'd'})
  }
})
