import test from 'ava'
import {expect} from 'chai'

import {Router, route, head, options, get, post, put, patch, del} from 'sav-router'

test('api', (ava) => {
  expect(Router).to.be.a('function')
  expect(route).to.be.a('function')
  expect(head).to.be.a('function')
  expect(options).to.be.a('function')
  expect(get).to.be.a('function')
  expect(post).to.be.a('function')
  expect(put).to.be.a('function')
  expect(patch).to.be.a('function')
  expect(del).to.be.a('function')
})
