import test from 'ava'
import {expect} from 'chai'

import {Sav, authPlugin, NotImplementedException} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
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
  sav.use(authPlugin)

  let ctx = {}
  sav.use({
    setup (ctx, next) {
      next(async () => {
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
  sav.use(authPlugin)

  let ctx = {}
  sav.use({
    setup (ctx, next) {
      next(async () => {
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
