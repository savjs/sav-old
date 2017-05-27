import test from 'ava'
import {expect} from 'chai'

import {Sav} from 'sav'

import contract from '../fixtures/contract'
import actions from '../fixtures/action'

test('api', (ava) => {
  expect(Sav).to.be.a('function')
  expect(contract).to.be.a('object')
  expect(actions).to.be.a('object')
})

test('sav', async ava => {
  let sav = new Sav()
  expect(sav).to.be.a('object')
})

test('installPlugin', async ava => {
  let sav = new Sav({
    neat: true
  })
  sav.use({
    name: 'test',
    prepare () {},
    setup () {},
    payload () {},
    teardown () {}
  })
  sav.use({prepare () {}})
  sav.use({setup () {}})
  sav.use({payload () {}})
  sav.use({teardown () {}})
  sav.use({})
  sav.use([{}])
  sav.use(() => {})
})

async function testSav (plugins) {
  let sav = new Sav({
    neat: true,
    execNotThrow: true
  })
  sav.use(plugins)
  await sav.exec({})
  return sav
}

test('pluginException', async ava => {
  await Promise.all(['setup', 'preload', 'teardown'].map(async (name) => {
    await testSav({
      [`${name}`] () {
        throw new Error('xxx')
      },
      error (err) {
        expect(err.message).to.eql('xxx')
      }
    })
  }))
  let exp
  try {
    let sav = new Sav({
      neat: true
    })
    sav.use({
      prepare () {
        throw new Error('xxx')
      }
    })
    await sav.prepare()
  } catch (err) {
    exp = err
  } finally {
    expect(exp).to.be.a('error')
  }
})
