import test from 'ava'
import {expect} from 'chai'

import contract from '../fixtures/contract'
import {normalizeUris, normalizeRoutes, matchModulesRoute} from 'sav'

test('convert.normalizeRoutes', (ava) => {
  expect(normalizeUris).to.be.a('function')
  expect(normalizeRoutes).to.be.a('function')
  expect(matchModulesRoute).to.be.a('function')
  normalizeUris(contract)
  expect(contract.uris).to.be.a('object')

  let routes = normalizeRoutes(contract)
  expect(routes).to.be.a('array')

  expect(matchModulesRoute(routes, '/api/article/comment/123', 'POST')).to.be.a('array')
  expect(matchModulesRoute(routes, '/article/modify/123', 'POST')).to.be.a('array')
  expect(matchModulesRoute(routes, '/articles/123', 'GET')).to.be.a('array')
})
