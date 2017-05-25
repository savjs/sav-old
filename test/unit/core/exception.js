import test from 'ava'
import {expect} from 'chai'
import {Exception, NotImplementedException, NotRoutedException, InvalidaArgumentException, EnsureException} from 'sav'

test('exception.api', (ava) => {
  expect(Exception).to.be.a('function')
  expect(NotImplementedException).to.be.a('function')
  expect(NotRoutedException).to.be.a('function')
  expect(InvalidaArgumentException).to.be.a('function')
  expect(EnsureException).to.be.a('function')
})

test('exception.default', (ava) => {
  let err = new Exception('xx')
  expect(err.stacks.length).to.eql(0)
  expect(Object.keys(err.toJSON()).sort()).to.eql(['message', 'type', 'stack', 'stacks'].sort())
  let err2 = new Exception(new Error('xx'))

  expect(err2.stacks.length).to.eql(1)
  expect(Object.keys(err2.toJSON()).sort()).to.eql(['message', 'type', 'stack', 'stacks'].sort())

  let err3 = new Exception(err2)
  expect(err3.stacks.length).to.eql(2)
})
