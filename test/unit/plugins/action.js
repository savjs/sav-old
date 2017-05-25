import test from 'ava'
import {expect} from 'chai'

import {Sav, propsPlugin, actionPlugin} from 'sav'
import actions from '../fixtures/action'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(propsPlugin).to.be.a('function')
  expect(actionPlugin).to.be.a('function')
  expect(actions).to.be.a('object')
})

test('actionPlugin', async (ava) => {
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
