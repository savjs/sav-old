import test from 'ava'
import {expect} from 'chai'

import {route, head, options, get, post, put, patch, del, refer} from 'sav-core'

test('decorators#api', ava => {
  class Test {
    @route(['get', 'post']) route () {}
    @head() head () {}
    @options() options () {}
    @get() get () {}
    @post() post () {}
    @put() put () {}
    @patch() patch () {}
    @del() del () {}
  }
  expect(refer(Test)).to.deep.equal({
    route: [['route', ['GET', 'POST']]],
    head: [['route', ['HEAD']]],
    options: [['route', ['OPTIONS']]],
    get: [['route', ['GET']]],
    post: [['route', ['POST']]],
    put: [['route', ['PUT']]],
    patch: [['route', ['PATCH']]],
    del: [['route', ['DELETE']]]
  })
})

test('decorators', ava => {
  class Test {
    @get()
    test () {}

    @del()
    test2 () {}

    @post('a')
    test3 () {}

    @route('get', ':abc')
    test4 () {}
  }
  expect(refer(Test)).to.deep.equal({
    test: [['route', ['GET']]],
    test2: [['route', ['DELETE']]],
    test3: [['route', ['POST'], 'a']],
    test4: [['route', ['GET'], ':abc']]
  })
})
