import test from 'ava'
import {expect} from 'chai'
import {Sav} from 'sav'
import Koa from 'koa'
import supertest from 'supertest'
import path from 'path'

test('api', async (ava) => {
  expect(Sav).to.be.a('function')
})

function createSavKoa () {
  let app = new Koa()
  let sav = new Sav({
    rootPath: path.resolve(__dirname, './fixtures/'),
    prod: true
  })
  app.use(sav.compose())
  return {
    sav,
    app,
    st: supertest(app.listen())
  }
}

test('Sav.basic', async (ava) => {
  let {sav, st} = createSavKoa()
  sav.declare({
    actions: {
      Home: {
        routes: {
          index: {
            method: 'GET'
          }
        }
      }
    },
    modals: {
      Home: {
        index () {
          return {name: 'hello world'}
        }
      }
    }
  })
  {
    let res = await st.get('/home/index').set('Accept', 'application/json')
    expect(res.status).to.eql(200)
    expect(res.body).to.eql({name: 'hello world'})
  }
  {
    let res = await st.get('/404').set('Accept', 'application/json')
    expect(res.status).to.eql(404)
    expect(res.body.message).to.eql('Not Found')
  }
  {
    let res = await st.get('/404')
    expect(res.status).to.eql(404)
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('&quot;status&quot;: 404')).to.be.not.eql(-1)
  }
  {
    let res = await st.get('/home/index')
    expect(res.status).to.eql(200)
    expect(res.text).to.be.a('string')
    expect(res.text.indexOf('hello')).to.be.not.eql(-1)
  }
})
