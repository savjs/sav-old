import test from 'ava'
import {expect} from 'chai'
import {Sav, propsPlugin, uriPlugin, schemaPlugin} from 'sav'
import contract from '../fixtures/contract'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(propsPlugin).to.be.a('function')
  expect(uriPlugin).to.be.a('function')
  expect(schemaPlugin).to.be.a('function')
})

test('routerPlugin', async (ava) => {
  let sav = new Sav({
    neat: true
  })
  sav.use(uriPlugin)
  sav.use(schemaPlugin)
  sav.use({
    setup ({ctx, schema}) {
      expect(schema).to.be.a('object')
      console.log(Object.keys(schema))
    }
  })
  sav.prepare(contract)
})
