import test from 'ava'
import {expect} from 'chai'

import apis from './fixtures/implements/api/index.js'
import pages from './fixtures/implements/page/index.js'
import layouts from './fixtures/implements/layout/index.js'

test('Api', (ava) => {
  expect(apis).to.be.a('array')
  let api = apis[0]
  expect(api.actions).to.be.a('object')
  expect(typeof api.actions.comment).to.eql('function')
})

test('Page', (ava) => {
  expect(pages).to.be.a('array')
  let page = pages[0]
  expect(page.actions).to.be.a('object')
  expect(page.actions.list).to.be.a('function')
  expect(page.actions.view).to.be.a('function')
  expect(page.actions.modify).to.be.a('function')
  expect(page.actions.update).to.be.a('function')
  expect(page.actions.comment).to.be.a('function')
})

test('Layout', (ava) => {
  expect(layouts).to.be.a('array')
  let admin = layouts[0]
  expect(admin.actions).to.be.a('object')
  expect(admin.actions.invoke).to.be.a('function')
  expect(admin.actions.adminNavMenu).to.be.a('function')

  let user = layouts[1]
  expect(user.actions).to.be.a('object')
  expect(user.actions.invoke).to.be.a('function')
  expect(user.actions.userInfo).to.be.a('function')
  expect(user.actions.userNavMenu).to.be.a('function')

  let guest = layouts[2]
  expect(guest.actions).to.be.a('object')
  expect(guest.actions.invoke).to.be.a('function')
  expect(guest.actions.copyRight).to.be.a('function')
})
