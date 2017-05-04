import test from 'ava'
import {expect} from 'chai'

import {Config} from 'sav/core/config.js'

test('config.api', (ava) => {
  let config = new Config({})
  expect(config.has).to.be.a('function')
  expect(config.get).to.be.a('function')
  expect(config.set).to.be.a('function')
  expect(config.prepend).to.be.a('function')
  expect(config.append).to.be.a('function')
  expect(config.env).to.be.a('function')
})

test('config.default', (ava) => {
  let config = new Config()
  expect(config.get('a', 'b')).to.eql('b')
  expect(config.get('a')).to.eql(null)
  expect(config.has('a')).to.eql(false)
  config.set('a', 'b')
  expect(config.get('a')).to.eql('b')
  expect(config.get('a', 'c')).to.eql('b')
  expect(config.has('a')).to.eql(true)
  config.set({
    b: 'c'
  })
  expect(config.get('b')).to.eql('c')
  expect(config.has('b')).to.eql(true)

  expect(JSON.stringify(config)).to.eql(JSON.stringify({a: 'b', b: 'c'}))

  expect(config.env('x')).to.eql(null)
  expect(config.env('x', 'y')).to.eql('y')
  process.env.x = 'y'
  expect(config.env('x')).to.eql('y')

  config.prepend('m', 1)
  expect(config.get('m')).to.eql([1])

  config.append('m', 2)
  expect(config.get('m')).to.eql([1, 2])

  config.prepend('m', 0)
  expect(config.get('m')).to.eql([0, 1, 2])

  config.append('n', 0)
  expect(config.get('n')).to.eql([0])
})
