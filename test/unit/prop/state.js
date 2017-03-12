import test from 'ava'
import {expect} from 'chai'

import {prop, state, promise} from 'sav-core'

test('state api', ava => {
  let ctx = {}
  state(ctx)
  expect(ctx.state).to.be.a('object')
  expect(ctx.setState).to.be.a('function')
  expect(ctx.replaceState).to.be.a('function')
})

test('state inject promise', ava => {
  let ctx = {}
  prop(ctx)
  state(ctx)
  expect(ctx.state).to.be.a('object')
  expect(ctx.setState).to.be.a('function')
  expect(ctx.replaceState).to.be.a('function')
})

test('state methods', ava => {
  let ctx = {}
  prop(ctx)
  promise(ctx)
  state(ctx)

  ctx.setState()
  expect(ctx.state).to.be.eql({})

  ctx.setState({a: 1})
  expect(ctx.state).to.be.eql({a: 1})

  ctx.setState({a: 2}, {b: 3})
  expect(ctx.state).to.be.eql({a: 2, b: 3})

  ctx.setState([{a: 4}, {b: 5}])
  expect(ctx.state).to.be.eql({a: 4, b: 5})

  ctx.replaceState()
  expect(ctx.state).to.be.eql({})

  ctx.replaceState({a: 4, b: 5})
  expect(ctx.state).to.be.eql({a: 4, b: 5})
})
