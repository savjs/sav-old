import test from 'ava'
import {expect} from 'chai'

import {Sav, NotRoutedException, propsPlugin, actionPlugin, uriPlugin, routerPlugin, statePlugin} from 'sav'
import contract from './fixtures/contract'
import actions from './fixtures/action'

test('sav.neat', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  expect(await sav.exec({})).to.be.eql({})
})

test('sav.routerPlugin', async (ava) => {
  let sav = new Sav({
    neat: true
  })
  sav.use(uriPlugin)
  sav.use(routerPlugin)
  sav.prepare(contract)
  let ctx = {
    path: '/articles/123',
    method: 'GET'
  }
  await sav.exec(ctx)
  expect(ctx.route).to.be.a('object')
  expect(ctx.params).to.be.a('object')

  {
    let exp
    try {
      await sav.exec({})
    } catch (err) {
      exp = err
      expect(err).to.be.a('error')
    } finally {
      expect(exp instanceof NotRoutedException).to.eql(true)
    }
  }

  {
    let exp
    try {
      await sav.exec({path: '/xxxx', method: 'XXX'})
    } catch (err) {
      exp = err
      expect(err).to.be.a('error')
    } finally {
      expect(exp instanceof NotRoutedException).to.eql(true)
    }
  }
})

test('sav.actionPlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(actionPlugin)
  sav.prepare({actions})

  let ctx = {}
  sav.use({
    setup (ctx) {
      expect(ctx.prop).to.be.a('function')
      expect(ctx.sav).to.be.a('object')
    },
    teardown (ctx) {
      expect(ctx.prop).to.be.a('function')
      expect(ctx.sav).to.be.a('object')
    }
  })
  await sav.exec(ctx)
  expect(ctx.prop).to.be.not.a('function')
  expect(ctx.sav).to.be.not.a('object')
})

test('sav.statePlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(statePlugin)

  let ctx = {}
  sav.use({
    setup (ctx) {
      expect(ctx.setState).to.be.a('function')
      expect(ctx.replaceState).to.be.a('function')
      expect(ctx.state).to.be.a('object')
    },
    teardown (ctx) {
      expect(ctx.setState).to.be.a('function')
      expect(ctx.replaceState).to.be.a('function')
      expect(ctx.state).to.be.a('object')
    }
  })
  await sav.exec(ctx)
  expect(ctx.setState).to.be.not.a('function')
  expect(ctx.replaceState).to.be.not.a('function')
  expect(ctx.state).to.be.not.a('object')
})
