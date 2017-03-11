import test from 'ava'
import {expect} from 'chai'

import {convertCase} from 'sav-core'

test('convertCase', ava => {
  function batchConvert (strs) {
    for (let type in strs) {
      expect(convertCase(type, strs[type])).to.be.equal(strs[type])
    }
  }

  batchConvert({
    pascal: 'HelloWorld',
    camel: 'helloWorld',
    snake: 'hello_world',
    hyphen: 'hello-world'
  })

  batchConvert({
    pascal: 'SayHelloWorld',
    camel: 'sayHelloWorld',
    snake: 'say_hello_world',
    hyphen: 'say-hello-world'
  })

  batchConvert({
    pascal: 'Say',
    camel: 'say',
    snake: 'say',
    hyphen: 'say'
  })

  batchConvert({
    pascal: '',
    camel: '',
    snake: '',
    hyphen: ''
  })

  let str = 'aB-Cd'
  expect(convertCase('', str)).to.be.equal(str)
})
