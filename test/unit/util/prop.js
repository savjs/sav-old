import test from 'ava'
import {expect} from 'chai'

import {makeProp, delProps} from 'sav/util'

test('prop default', ava => {
  let ctx = {}
  makeProp(ctx)
  expect(ctx.ctx).to.equal(ctx)
  expect(ctx.prop).to.be.a('function')
  expect(ctx.prop.setter).to.be.a('function')
  expect(ctx.prop.getter).to.be.a('function')

  ctx.prop({a: 1, b: 2})
  expect(ctx.a).to.equal(1)
  expect(ctx.b).to.equal(2)
  let cval
  ctx.prop.setter('c', (value) => {
    cval = value
  })
  ctx.prop.getter('d', () => cval)

  ctx.c = 3
  expect(cval).to.equal(3)
  expect(ctx.d).to.equal(3)
  delProps(ctx)
  expect(ctx).to.eql({})
})

test('prop change ctx name', ava => {
  let ctx = {}
  makeProp(ctx, 'self')
  makeProp(ctx)
  expect(ctx.self).to.equal(ctx)
})
