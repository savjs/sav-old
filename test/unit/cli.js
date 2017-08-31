import test from 'ava'
import {expect} from 'chai'
import {loadInterface, writeContract, writeActions, writeSass, writeVue, writeRollup} from 'sav-cli'
import path from 'path'

test('api', async (ava) => {
  expect(loadInterface).to.be.a('function')
  expect(writeContract).to.be.a('Function')
  expect(writeActions).to.be.a('Function')
  expect(writeSass).to.be.a('Function')
  expect(writeRollup).to.be.a('Function')
})

test('convertInterface', async (ava) => {
  let modules = await loadInterface(path.resolve(__dirname, './fixtures/interface'))
  await writeContract(path.resolve(__dirname, './fixtures/contract'), modules)
  await writeActions(path.resolve(__dirname, './fixtures/actions'), modules.modals)
  await writeSass(path.resolve(__dirname, './fixtures/sass'), modules.modals)
  await writeSass(path.resolve(__dirname, './fixtures/sass-view'), modules.modals, {pageMode: false})
  await writeVue(path.resolve(__dirname, './fixtures/views'), modules.modals)
  await writeRollup(path.resolve(__dirname, './fixtures/scripts'))
  expect(modules).to.be.a('object')
})
