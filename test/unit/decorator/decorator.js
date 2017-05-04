import test from 'ava'
import {expect} from 'chai'
import {resolve} from 'path'
import {writeFileSync, readFileSync} from 'fs'

import ArticleApi from '../fixtures/interface/api/Article.js'
import ArticlePage from '../fixtures/interface/page/Article.js'

import AdminLayout from '../fixtures/interface/layout/Admin.js'
import UserLayout from '../fixtures/interface/layout/User.js'
import GuestLayout from '../fixtures/interface/layout/Guest.js'

let maps = {
  ArticleApi,
  ArticlePage,
  AdminLayout,
  UserLayout,
  GuestLayout
}
let files = {
  ArticleApi: '../fixtures/interface/api/Article.json',
  ArticlePage: '../fixtures/interface/page/Article.json',
  AdminLayout: '../fixtures/interface/layout/Admin.json',
  UserLayout: '../fixtures/interface/layout/User.json',
  GuestLayout: '../fixtures/interface/layout/Guest.json'
}

test('api', (ava) => {
  for (let name in maps) {
    expect(maps[name]).to.be.a('object')
  }
})

test('decorator.compare|write', (ava) => {
  let write = true
  for (let name in maps) {
    if (write) {
      writeFileSync(resolve(__dirname, files[name]), JSON.stringify(maps[name], null, 2))
    } else {
      expect(readFileSync(resolve(__dirname, files[name])).toString()).to.eql(JSON.stringify(maps[name], null, 2))
    }
  }
})
