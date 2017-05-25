import test from 'ava'
import {expect} from 'chai'
import * as type from 'sav/util'

test('type', (ava) => {
  const items = {
    'Object': {},
    'Array': [],
    'Nan': NaN,
    'Undefined': undefined,
    'Boolean': true,
    'Number': 1.0,
    'String': '',
    'Function': function () {},
    'RegExp': /text/,
    'Date': new Date()
  }
  Object.keys(items).forEach((name) => {
        // items
    Object.keys(items).forEach((key) => {
      let ret = type['is' + name](items[key])
      expect(ret).to.eql(name === key)
    })
  })
})

test('isType', async (ava) => {
  expect(type.isNull(null)).to.eql(true)
  expect(type.isUint(5)).to.eql(true)
  expect(type.isAsync(async () => {})).to.eql(true)
  expect(type.isPromise(Promise.resolve())).to.eql(true)
})

test('typeValue', async (ava) => {
  expect(type.typeValue(5)).to.eql('Number')
  expect(type.typeValue(undefined)).to.eql('Undefined')
  expect(type.typeValue(null)).to.eql('Null')
  expect(type.typeValue(NaN)).to.eql('Nan')
})
