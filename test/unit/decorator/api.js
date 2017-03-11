import test from 'ava'
import {expect} from 'chai'

import {conf, refer, quickConf, impl, annotateMethod, gen, generator, props} from 'sav-decorator'

test('api', (ava) => {
  expect(conf).to.be.a('function')
  expect(refer).to.be.a('function')
  expect(quickConf).to.be.a('function')
  expect(impl).to.be.a('function')
  expect(annotateMethod).to.be.a('function')
  expect(gen).to.be.a('function')
  expect(generator).to.be.a('function')
})

test('conf', (ava) => {
  class Test {
    @conf('hello', 'world')
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [[ 'hello', 'world' ]]})
})

test('quickConf', (ava) => {
  let prop = quickConf('prop')
  class Test {
    @prop('readonly')
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [[ 'prop', 'readonly' ]]})
})

test('multi conf', (ava) => {
  let prop = quickConf('prop')
  class Test {
    @prop()
    @prop
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [['prop'], ['prop']]})
})

test('multi gen', (ava) => {
  let prop = quickConf('prop')
  @gen
  class Test {
    @prop()
    @prop
    say () {}
  }
  expect(Test.actions.say.middleware).to.deep.equal([['prop'], ['prop']])
})

test('interface+impl', (ava) => {
  class TestInterface {
    @conf('hello', 'world')
    test () {}
  }

  @impl(TestInterface)
  class Test {
    test () {}
  }
  expect(generator({auth: true})(Test)).to.deep.equal({
    name: 'Test',
    props: {auth: true},
    actions: {
      test: {
        name: 'test',
        method: Test.prototype.test,
        middleware: [
          ['hello', 'world']
        ]
      }
    }
  })

  @gen
  @impl(TestInterface)
  class Test2 {
    @conf
    fail () {}
  }

  expect(Test2).to.deep.equal({
    name: 'Test2',
    props: {},
    actions: {
      test: {
        name: 'test',
        method: undefined,
        middleware: [
          ['hello', 'world']
        ]
      }
    }
  })
})

test('props', (ava) => {
  @gen
  @props({
    a: 'a1'
  })
  class Test {
    say () {}
  }
  expect(Test.props).to.eql({ a: 'a1' })
})

test('props + impl', (ava) => {
  @props({
    a: 'a1',
    b: 'b1'
  })
  class UserInterface {
    say () {}
  }

  @gen()
  @props({
    a: 'a2',
    c: 'c1'
  })
  @impl(UserInterface)
  @props({
    b: 'b2',
    d: 'd1'
  })
  class User {}

  expect(User.props).to.eql({d: 'd1', b: 'b1', a: 'a2', c: 'c1'})
})
