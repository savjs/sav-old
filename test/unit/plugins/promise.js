import test from 'ava'
import {expect} from 'chai'

import {Sav, promisePlugin} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(promisePlugin).to.be.a('function')
})

test('promisePlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(promisePlugin)

  let ctx = {}
  sav.use({
    setup (ctx) {
      expect(ctx.resolve).to.be.a('function')
      expect(ctx.reject).to.be.a('function')
      expect(ctx.all).to.be.a('function')
    },
    teardown (ctx) {
      expect(ctx.resolve).to.be.a('function')
      expect(ctx.reject).to.be.a('function')
      expect(ctx.all).to.be.a('function')
    }
  })
  await sav.exec(ctx)
  expect(ctx.resolve).to.be.not.a('function')
  expect(ctx.reject).to.be.not.a('function')
  expect(ctx.all).to.be.not.a('function')
})
