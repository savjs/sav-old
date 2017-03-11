import test from 'ava'
import {expect} from 'chai'

import {prop, promise, state, propPlugin} from 'sav-core'

test('ensure prop export apis', ava => {
  expect(prop).to.be.a('function')
  expect(promise).to.be.a('function')
  expect(state).to.be.a('function')
})

test('prop default', ava => {
  let ctx = {}
  prop(ctx)
  expect(ctx.ctx).to.equal(ctx)
  expect(ctx.prop).to.be.a('function')
  expect(ctx.prop.setter).to.be.a('function')
  expect(ctx.prop.getter).to.be.a('function')

  ctx.prop({a: 1, b: 2})
  expect(ctx.a).to.equal(1)
  expect(ctx.b).to.equal(2)

  ctx.prop.setter('c', (value) => {
    ctx._c = value
  })
  ctx.prop.getter('d', () => ctx._c)

  ctx.c = 3
  expect(ctx._c).to.equal(3)
  expect(ctx.d).to.equal(3)
})

test('prop change ctx name', ava => {
  let ctx = {}
  prop(ctx, 'self')
  expect(ctx.self).to.equal(ctx)
})

test('promise default', async (ava) => {
  let ctx = {}
  prop(ctx)
  promise(ctx)
  expect(await ctx.resolve(1)).to.equal(1)
  try {
    await ctx.reject('reject')
  } catch (err) {
    expect(err).to.equal('reject')
  }

  let ret = await ctx.all([
    (async () => 1)(),
    (async () => 2)()
  ])
  expect(ret).to.eql([1, 2])

  expect(await ctx.then((resolve) => resolve(1))).to.equal(1)
})

test('promise inject prop', async (ava) => {
  let ctx = {}
  promise(ctx)
  expect(await ctx.resolve(1)).to.equal(1)
})

test('propPlugin', async (ava) => {
  let ctx = {
    end () {},
    async use ({payload}) {
      await payload(ctx, async () => {
        expect(ctx.prop).to.be.a('function')
        expect(ctx.resolve).to.be.a('function')
        expect(ctx.setState).to.be.a('function')
      })
    }
  }
  propPlugin(ctx)
})

test('propPlugin.body', async (ava) => {
  let ctx = {
    end () {},
    async use ({payload}) {
      await payload(ctx, async () => {
        ctx.setState({a: 1})
      })
      expect(ctx.state).to.eql({a: 1})
    }
  }
  propPlugin(ctx)
})
