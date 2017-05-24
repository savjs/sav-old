import test from 'ava'
import {expect} from 'chai'

import {Sav, NotRoutedException, propsPlugin, actionPlugin, routerPlugin} from 'sav'
import contract from './fixtures/contract'
import actions from './fixtures/action'

test('api', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  expect(await sav.exec(1)).to.be.eql(1)
  expect(await sav.exec({})).to.be.eql({})
  expect(await sav.exec([])).to.be.eql([])
  expect(await sav.exec()).to.be.eql(undefined)
})

test('sav.routerPlugin', async (ava) => {
  let sav = new Sav({
    neat: true
  })
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
    setup ({ctx}) {
      expect(ctx.sav).to.be.a('object')
    }
  })
  await sav.exec(ctx)
  expect(ctx.sav).to.be.not.a('object')
})
