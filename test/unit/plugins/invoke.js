import test from 'ava'
import {expect} from 'chai'
import {Sav, invokePlugin} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(invokePlugin).to.be.a('function')
})

test('invoke', async ava => {
  let sav = new Sav({
    neat: true,
    invokeQueues: [
      'test'
    ]
  })
  sav.use(invokePlugin)
  sav.use({
    setup (ctx) {
      ctx.test = () => {
        ctx.state = {a: 1}
      }
    }
  })
  let ctx = {}
  await sav.exec(ctx)
  expect(ctx.state).to.eql({a: 1})
})

test('invoke.Layout', async ava => {
  let sav = new Sav({
    neat: true,
    invokeLayout: true,
    invokeQueues: [
      'test'
    ]
  })
  sav.use(invokePlugin)
  sav.use({
    setup (ctx) {
      ctx.test = () => {
        ctx.state = {a: 1}
      }
    }
  })
  let ctx = {
    uri () {
      return {
        layout: 'User'
      }
    },
    route: {
      uri: 'page.Test.test'
    },
    sav: {
      LayoutUser: {
        invoke () {
          ctx.state.b = 1
        }
      }
    }
  }
  await sav.exec(ctx)
  expect(ctx.state).to.eql({a: 1, b: 1})
})
