import test from 'ava'
import {expect} from 'chai'

import {conf, get, route, refer, quickConf, impl, annotateMethod, gen, generator, props} from 'sav/decorator'

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
  expect(JSON.parse(JSON.stringify(ref))).to.eql({
    moduleName: 'Test',
    uri: 'Test',
    props: {auth: true},
    routes: [
      {
        actionName: 'test',
        uri: 'Test.test',
        middlewares: [
          {
            name: 'hello',
            props: 'world'
          }
        ]
      }
    ]
  })

  @gen
  @impl(TestInterface)
  class Test2 {
    @conf
    fail () {}
  }
  expect(Test2).to.eql({
    moduleName: 'Test2',
    uri: 'Test2',
    props: {},
    routes: [
      {
        actionName: 'test',
        uri: 'Test2.test',
        middlewares: [
          {
            name: 'hello',
            props: 'world'
          }
        ]
      }
    ]
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

test('route', (ava) => {
  @gen
  class Test {
    @get()
    say () {}

    @route('get')
    bye () {}
  }
  expect(Test.routes.length).to.eql(2)
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
