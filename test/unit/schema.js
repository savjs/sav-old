import test from 'ava'
import {expect} from 'chai'
import {Schema, Router} from 'sav'

test('api', async (ava) => {
  expect(Schema).to.be.a('function')
})

function createSchema (opts) {
  let schema = new Schema(opts)
  if (!opts) {
    schema.setOptions({
      schemaReqField: 'request',
      schemaResField: 'response',
      schemaReqPrefix: 'Req',
      schemaResPrefix: 'Res'
    })
  }
  return schema
}

test('Schema.declare', async (ava) => {
  let schema = createSchema()
  schema.declare({
    UserInfo: {
      props: {
        userId: Number
      }
    }
  })
  expect(schema.getSchema('UserInfo')).to.be.a('object')
})

test('Schema.Router', async (ava) => {
  let router = new Router()
  let schema = createSchema()
  schema.declare({
    Sex: {
      default: 1,
      enums: [
        {
          key: 'male',
          value: 1
        },
        {
          key: 'female',
          value: 2
        }
      ]
    }
  })
  schema.setRouter(router)
  router.declare({
    User: {
      routes: {
        Profile: {
          request: {
            props: {
              userId: Number,
              sex: 'Sex'
            }
          }
        }
      }
    }
  })
  expect(schema.getSchema('ReqUserProfile')).to.be.a('object')
})

test('Schema.Schema', async (ava) => {
  let router = new Router()
  let schema = createSchema()
  schema.declare({
    AboutInfo: {
      props: {
        aboutInfo: String
      }
    }
  })
  schema.setRouter(router)
  router.declare({
    Home: {
      routes: {
        User: {
          request: {
            name: 'UserInfo',
            props: {
              userId: Number
            }
          }
        },
        About: {
          request: 'AboutInfo'
        }
      }
    }
  })
  expect(schema.getSchema('ReqHomeAbout')).to.eql(undefined)
  expect(schema.getSchema('AboutInfo')).to.be.a('object')
  expect(schema.getSchema('ReqHomeUser')).to.eql(undefined)
  expect(schema.getSchema('UserInfo')).to.be.a('object')
})

test('Schema.Options', async (ava) => {
  let router = new Router()
  let schema = createSchema({
    schemaReqField: 'req',
    schemaResField: 'res',
    schemaReqPrefix: 'C',
    schemaResPrefix: 'S'
  })
  schema.setRouter(router)
  router.declare({
    Home: {
      routes: {
        User: {
          req: {
            props: {
              userId: Number
            }
          },
          res: {
            props: {
              userId: Number
            }
          }
        }
      }
    }
  })
  expect(schema.getSchema('CHomeUser')).to.be.a('object')
  expect(schema.getSchema('SHomeUser')).to.be.a('object')
})
