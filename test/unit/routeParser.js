import test from 'ava'
import {expect} from 'chai'
import {resolve} from 'path'
import {writeFileSync, readFileSync} from 'fs'
import {convertRoute} from '@sav/router'

import ArticleApi from './fixtures/interface/api/Article.js'
import ArticlePage from './fixtures/interface/page/Article.js'

let maps = {
  ArticleApi,
  ArticlePage
}
let files = {
  ArticleApi: './fixtures/interface/api/ArticleRoute.json',
  ArticlePage: './fixtures/interface/page/ArticleRoute.json'
}

test('routeParser.compare|write', (ava) => {
  let write = true
  for (let name in maps) {
    if (write) {
      writeFileSync(resolve(__dirname, files[name]),
        JSON.stringify(convertRoute(maps[name]), null, 2))
    } else {
      expect(readFileSync(resolve(__dirname, files[name])).toString()).to
        .eql(JSON.stringify(convertRoute(maps[name]), null, 2))
    }
  }
})
