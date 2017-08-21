import test from 'ava'
import {expect} from 'chai'
import {InterfaceLoader} from 'sav'
import path from 'path'

test('api', async (ava) => {
  expect(InterfaceLoader).to.be.a('function')
})

test('loadDir', async (ava) => {
  let loader = new InterfaceLoader()
  let modules = await loader.loadDir(path.resolve(__dirname, './fixtures/interface'))
  await loader.saveContract(path.resolve(__dirname, './fixtures/contract'), modules)
  expect(modules).to.be.a('object')
})
