import test from 'ava'
import {expect} from 'chai'
import {Sav, statePlugin, renderPlugin, koaPlugin} from 'sav'
import {resolve} from 'path'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(statePlugin).to.be.a('function')
  expect(renderPlugin).to.be.a('function')
  expect(koaPlugin).to.be.a('function')
})

test('koaPlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true,
    viewRoot: resolve(__dirname, '../fixtures/view')
  })
  sav.use(statePlugin)
  sav.use(renderPlugin)
  sav.use(koaPlugin)

  let ctx = {}
  sav.use({
    setup ({ctx, renderer, setRenderData, setState}, next) {
      next(async() => {
        setRenderData('json')
        setState({b: 2})
        await renderer(ctx)
        expect(ctx.body).to.eql({b: 2})

        setRenderData('json', {a: 1})
        await renderer(ctx)
        expect(ctx.body).to.eql({a: 1})

        setRenderData('raw', {c: 3})
        await renderer(ctx)
        expect(ctx.body).to.eql({c: 3})

        setRenderData('html', {title: 'world'})
        await renderer(ctx)
        expect(ctx.body).to.be.a('string')
      })
    }
  })
  await sav.exec(ctx)
})

test('koaPlugin2', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true,
    viewRoot: resolve(__dirname, '../fixtures/view'),
    viewTemplate: 'pure.html'
  })
  sav.use(statePlugin)
  sav.use(renderPlugin)
  sav.use(koaPlugin)

  let acceptType
  let ctx = {
    accept: {
      type () {
        return acceptType
      }
    }
  }
  sav.use({
    setup ({ctx, renderer, setData, setRenderData}, next) {
      acceptType = 'html'
      expect(ctx.acceptType).to.eql(acceptType)
      acceptType = 'json'
      expect(ctx.acceptType).to.eql(acceptType)
      acceptType = 'x'
      expect(ctx.acceptType).to.not.eql(acceptType)
      next(async () => {
        setRenderData('html', {title: 'world'})
        await renderer(ctx)
        expect(ctx.body).to.be.a('string')

        setRenderData('json', {title: 'world'})
        await renderer(ctx)
        expect(ctx.body).to.eql({title: 'world'})
      })
    },
    teardown (ctx, next) {
      next(() => {
        ctx.setData({title: 'world'})
      })
    }
  })
  await sav.exec(ctx)
})
