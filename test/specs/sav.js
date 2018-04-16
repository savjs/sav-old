import test from 'ava'
import {expect} from 'chai'
import {Sav} from '../../src/Sav.js'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import supertest from 'supertest'
import path from 'path'

test('api', async (ava) => {
  expect(Sav).to.be.a('function')
  ava.pass()
})

function createSavKoa () {
  let app = new Koa()
  let sav = new Sav({
    prod: true
  })
  app.use(bodyParser())
  app.use(sav.compose())
  return {
    sav,
    app,
    st: supertest(app.listen())
  }
}

test('Sav.basic', async (ava) => {
  let {sav, st} = createSavKoa()
  sav.load({
    contract: {
      modals: {
        Home: {
          routes: {
            index: {
              method: 'GET'
            },
            login: {
              method: 'POST',
              request: {
                props: {
                  userName: String,
                  password: String
                }
              },
              response: {
                props: {
                  userId: Number
                }
              }
            }
          }
        }
      }
    },
    modals: {
      Home: {
        index () {
          return {name: 'hello world'}
        },
        async login ({ctx, schema: {ReqHomeLogin, ResHomeLogin}}, {input}) {
          expect(ReqHomeLogin).to.be.a('object')
          expect(ResHomeLogin).to.be.a('object')
          let userId = 0
          switch (input.userName) {
            case 'x':
              userId = 1
              break
            default:
              return {}
          }
          return {userId}
        }
      }
    }
  })
  {
    let res = await st.get('/home/index').accept('json')
    expect(res.status).to.eql(200)
    expect(res.body).to.eql({name: 'hello world'})
  }
  {
    let res = await st.get('/404').accept('json')
    expect(res.status).to.eql(404)
    expect(res.body.error).to.be.a('object')
    expect(res.body.error.message).to.eql('Not Found')
  }
  {
    let res = await st.get('/404')
    expect(res.status).to.eql(404)
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('404')).to.be.not.eql(-1)
  }
  {
    let res = await st.get('/home/index')
    expect(res.status).to.eql(200)
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('hello')).to.be.not.eql(-1)
  }
  {
    let res = await st.post('/home/login')
      .accept('json')
      .send({userName: 'x', password: 'x'})
    expect(res.status).to.eql(200)
    expect(res.body).to.eql({userId: 1})
  }
  {
    let res = await st.post('/home/login')
      .accept('json')
      .send({userName: {}, password: 'x'})
    expect(res.status).to.eql(400)
    expect(res.body.error).to.be.a('object')
    expect(res.body.error.path).to.eql('userName')
  }
  {
    let res = await st.post('/home/login')
      .accept('json')
      .send({userName: 'y', password: 'x'})
    expect(res.status).to.eql(500)
    expect(res.body.error).to.be.a('object')
    expect(res.body.error.path).to.eql('userId')
  }
  ava.pass()
})
