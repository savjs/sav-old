import test from 'ava'
import {expect} from 'chai'

import {Sav, propsPlugin, actionPlugin} from 'sav'
import actions from '../fixtures/action'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(propsPlugin).to.be.a('function')
  expect(actionPlugin).to.be.a('function')
  expect(actions).to.be.a('object')
})

test('actionPlugin.noop', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(actionPlugin)
  sav.prepare({})

  let ctx = {}
  sav.use({
    setup ({ctx, sav}) {
      expect(ctx.prop).to.be.a('function')
      expect(sav).to.be.a('undefined')
    }
  })
  await sav.exec(ctx)
  expect(ctx.prop).to.be.not.a('function')
  expect(ctx.sav).to.be.a('undefined')
})

test('actionPlugin', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(actionPlugin)
  sav.prepare({actions})

  let ctx = {}
  sav.use({
    setup ({ctx, sav}) {
      expect(ctx.prop).to.be.a('function')
      expect(sav).to.be.a('object')
      let exec = async () => {
        let exp
        try {
          await sav.ApiArticle.comment()
          await sav.LayoutUser.userInfo()
          await sav.PageArticle.view()
          await sav.PageArticle.modify()
          await sav.PageHome.index()
          await sav.PageHome.index()
          await sav.PageHome.about()
        } catch (err) {
          exp = err
        } finally {
          expect(exp).to.be.a('undefined')
        }
      }
      exec()
    }
  })
  await sav.exec(ctx)
  expect(ctx.prop).to.be.not.a('function')
  expect(ctx.sav).to.be.not.a('object')
})

test('actionPlugin.sav', async (ava) => {
  expect(Sav).to.be.a('function')
  let sav = new Sav({
    neat: true
  })
  sav.use(propsPlugin)
  sav.use(actionPlugin)

  class Test {
    async test ({sav}) {
      expect(sav).to.be.a('object')
      let ret = await this.another('test2')
      expect(ret).to.eql('test2') // this useage
    }
    another ({sav}, text) {
      return sav.PageTest2.test2(text) // sav uesage
    }
  }
  sav.prepare({
    actions: {
      api: {
        Test
      },
      page: {
        Test2: {
          async test2 (ctx, text) {
            return text
          }
        }
      }
    }
  })

  let ctx = {}
  sav.use({
    setup ({ctx, sav}) {
      expect(ctx.prop).to.be.a('function')
      expect(sav).to.be.a('object')
      expect(sav.ApiTest).to.be.a('object')
      let exec = async () => {
        let exp
        try {
          await sav.ApiTest.test()
        } catch (err) {
          exp = err
          console.error(err)
        } finally {
          expect(exp).to.be.a('undefined')
        }
      }
      exec()
    }
  })
  await sav.exec(ctx)
  expect(ctx.prop).to.be.not.a('function')
  expect(ctx.sav).to.be.not.a('object')
})
