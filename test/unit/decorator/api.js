import test from 'ava'
import {expect} from 'chai'

import {conf, refer, quickConf, impl, annotateMethod, gen, generator, props} from 'sav-core'

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
    @prop()
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
    @prop('a')
    say () {}
  }
  expect(Test.actions.say.props).to.deep.equal({prop: []})
  expect(Test.actions.say.config).to.deep.equal([['prop', 'a'], ['prop']])
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
  let ref
  ref = generator({auth: true})(Test)
  expect(ref.actions.test.method).to.eql(Test.prototype.test)
  expect(JSON.parse(JSON.stringify(ref))).to.eql({
    moduleName: 'Test',
    props: {auth: true},
    actions: {
      test: {
        actionName: 'test',
        props: {
          hello: ['world']
        },
        config: [
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

  expect(Test2).to.eql({
    moduleName: 'Test2',
    props: {},
    actions: {
      test: {
        actionName: 'test',
        props: {
          hello: ['world']
        },
        config: [
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
