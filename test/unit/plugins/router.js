import test from 'ava'
import {expect} from 'chai'

import {Sav, uriPlugin, routerPlugin, NotRoutedException} from 'sav'
import contract from '../fixtures/contract'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(uriPlugin).to.be.a('function')
  expect(routerPlugin).to.be.a('function')
  expect(contract).to.be.a('object')
})

test('routerPlugin', async (ava) => {
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
  expect(ctx.router).to.be.a('object')

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
