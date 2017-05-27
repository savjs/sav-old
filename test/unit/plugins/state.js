import test from 'ava'
import {expect} from 'chai'
import {Sav, statePlugin} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(statePlugin).to.be.a('function')
})

test('statePlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(statePlugin)

  let ctx = {}
  sav.use({
    setup ({ctx, setState, replaceState}) {
      expect(setState).to.be.a('function')
      expect(replaceState).to.be.a('function')
      expect(ctx.state).to.be.a('object')

      setState()
      expect(ctx.state).to.be.eql({})

      setState({a: 1})
      expect(ctx.state).to.be.eql({a: 1})

      setState({a: 2}, {b: 1})
      expect(ctx.state).to.be.eql({a: 2, b: 1})

      replaceState()
      expect(ctx.state).to.be.eql({})

      replaceState({a: 1})
      expect(ctx.state).to.be.eql({a: 1})

      setState([{a: 2}, {b: 1}])
      expect(ctx.state).to.be.eql({a: 2, b: 1})
    },
    teardown (ctx) {
      expect(ctx.setState).to.be.a('function')
      expect(ctx.replaceState).to.be.a('function')
      expect(ctx.state).to.be.a('object')
    }
  })
  await sav.exec(ctx)
  expect(ctx.setState).to.be.not.a('function')
  expect(ctx.replaceState).to.be.not.a('function')
  expect(ctx.state).to.be.not.a('object')
})
