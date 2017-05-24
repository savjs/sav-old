import test from 'ava'
import {expect} from 'chai'

import contract from './fixtures/contract'
import {convertRouters, matchModulesRoute} from 'sav'

test('convert.convertRouters', (ava) => {
  expect(convertRouters).to.be.a('function')
  expect(matchModulesRoute).to.be.a('function')
  let ret = convertRouters(contract)
  expect(ret.uris).to.be.a('object')
  expect(ret.routes).to.be.a('array')

  expect(matchModulesRoute(ret.routes, '/api/article/comment/123', 'POST')).to.be.a('array')
  expect(matchModulesRoute(ret.routes, '/article/modify/123', 'POST')).to.be.a('array')
  expect(matchModulesRoute(ret.routes, '/articles/123', 'GET')).to.be.a('array')
})
