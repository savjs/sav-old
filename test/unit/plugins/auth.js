import test from 'ava'
import {expect} from 'chai'

import {Sav, propsPlugin, authPlugin, NotImplementedException} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(propsPlugin).to.be.a('function')
  expect(authPlugin).to.be.a('function')
})

test('authPlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true,
    auth () {
      return 1
    }
  })
  sav.use(propsPlugin)
  sav.use(authPlugin)

  let ctx = {}
  sav.use({
    setup (ctx, promise) {
      promise.then(async () => {
        expect(await ctx.auth()).to.eql(1)
      })
    }
  })
  await sav.exec(ctx)
  expect(ctx.auth).to.be.not.a('function')
})

test('authPlugin.Exception', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(authPlugin)

  let ctx = {}
  sav.use({
    setup (ctx, promise) {
      promise.then(async () => {
        let exp
        try {
          await ctx.auth()
        } catch (err) {
          exp = err
        } finally {
          expect(exp instanceof NotImplementedException).to.eql(true)
        }
      })
    }
  })
  await sav.exec(ctx)
  expect(ctx.auth).to.be.not.a('function')
})
