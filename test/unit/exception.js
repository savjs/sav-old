import test from 'ava'
import {expect} from 'chai'
import {Exception, HttpError} from 'sav'

test('exception.api', (ava) => {
  expect(Exception).to.be.a('function')
  expect(HttpError).to.be.a('function')
})

function toJSON (error) {
  return Object.assign({
    message: error.message,
    type: error.constructor.name,
    stack: error.stack
  }, error)
}

test('Exception', (ava) => {
  let err = new Exception('xx')
  expect(err.stacks.length).to.eql(0)
  expect(Object.keys(toJSON(err)).sort()).to.eql(['message', 'type', 'stack', 'stacks'].sort())
  let err2 = new Exception(new Error('xx'))

  expect(err2.stacks.length).to.eql(1)
  expect(Object.keys(toJSON(err2)).sort()).to.eql(['message', 'type', 'stack', 'stacks'].sort())

  let err3 = new Exception(err2)
  expect(err3.stacks.length).to.eql(2)
})

test('HttpError', (ava) => {
  let err = new HttpError(400)
  expect(err.stacks.length).to.eql(0)
  expect(Object.keys(toJSON(err)).sort()).to.eql(['message', 'type', 'stack', 'stacks', 'status'].sort())

  let err2 = new HttpError(400, 'NoFound1')
  expect(err2.message).to.eql('NoFound1')
})
