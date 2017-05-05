import test from 'ava'
import {expect} from 'chai'
import {proxyModuleActions} from 'sav/index.js'

test('proxy', async (ava) => {
  let ctx = {}
  ctx.sav = proxyModuleActions(ctx, {
    testApi: {
      prop: 1,
      test ({sav}) {
        return sav.testPage.test()
      }
    },
    testPage: {
      test () {
        return this.test1()
      },
      test1 () {
        return 'test1'
      }
    }
  })
  expect(await ctx.sav.testApi.test()).to.eql('test1')
  expect(await ctx.sav.testPage.test()).to.eql('test1')
  expect(await ctx.sav.testApi.prop).to.eql(undefined)
})
