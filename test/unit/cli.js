import test from 'ava'
import {expect} from 'chai'
import {loadInterface, writeContract, writeActions} from 'sav-cli'
import path from 'path'

test('api', async (ava) => {
  expect(loadInterface).to.be.a('function')
  expect(writeContract).to.be.a('Function')
  expect(writeActions).to.be.a('Function')
})

test('convertInterface', async (ava) => {
  let modules = await loadInterface(path.resolve(__dirname, './fixtures/interface'))
  await writeContract(path.resolve(__dirname, './fixtures/contract'), modules)
  await writeActions(path.resolve(__dirname, './fixtures/actions'), modules.actions)
  expect(modules).to.be.a('object')
})
