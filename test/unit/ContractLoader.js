import test from 'ava'
import {expect} from 'chai'
import {ContractLoader} from 'sav'

test('api', async (ava) => {
  expect(ContractLoader).to.be.a('function')
})
