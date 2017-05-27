import test from 'ava'
import {expect} from 'chai'
import {Sav, renderPlugin} from 'sav'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(renderPlugin).to.be.a('function')
})

test('renderPlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(renderPlugin)

  let ctx = {
    renderer (ctx) {
      expect(ctx.renderType).to.eql(null)
      expect(ctx.renderData).to.eql(null)
      expect(ctx.setData).to.be.a('function')
      expect(ctx.setRenderData).to.be.a('function')
      expect(ctx.setRaw).to.be.a('function')

      ctx.setData(1)
      expect(ctx.renderType).to.eql(null)
      expect(ctx.renderData).to.eql(1)

      ctx.setRaw(2)
      expect(ctx.renderType).to.eql('raw')
      expect(ctx.renderData).to.eql(2)

      ctx.setRenderData('x', 3)
      expect(ctx.renderType).to.eql('x')
      expect(ctx.renderData).to.eql(3)

      ctx.setRenderData('y')
      expect(ctx.renderType).to.eql('y')
      expect(ctx.renderData).to.eql(3)
    }
  }
  await sav.exec(ctx)
  expect(ctx.renderType).to.be.a('undefined')
  expect(ctx.renderData).to.be.a('undefined')
  expect(ctx.setData).to.be.a('undefined')
  expect(ctx.setRenderData).to.be.a('undefined')
  expect(ctx.setRaw).to.be.a('undefined')
})
