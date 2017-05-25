import test from 'ava'
import {expect} from 'chai'

import {Sav} from 'sav'

import contract from '../fixtures/contract'
import actions from '../fixtures/action'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(contract).to.be.a('object')
  expect(actions).to.be.a('object')
})

test('api', async ava => {
  let sav = new Sav()
  sav.prepare(Object.assign(contract, {actions}))
  let ctx = {
    path: '/',
    method: 'GET'
  }
  await sav.exec(ctx)
  expect(ctx.route).to.be.a('object')
  expect(ctx.params).to.be.a('object')
  expect(ctx.router).to.be.a('object')
})
