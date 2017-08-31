import test from 'ava'
import {expect} from 'chai'
import {Modal} from 'sav'

test('api', async (ava) => {
  expect(Modal).to.be.a('function')
})

test('Modal.declare', async (ava) => {
  let modal = new Modal()
  class Article {
    list () {}
  }
  modal.declare({
    Home: {
      index () {}
    },
    Article
  })
  expect(modal.modals.Home).to.be.a('object')
  expect(modal.getAction('Home.index')).to.be.a('function')
  expect(modal.modals.Article).to.be.a('object')
  expect(modal.getAction('Article.list')).to.be.a('function')
  modal.declareModal('Article', Article)
  expect(modal.modals.Article).to.be.a('object')
  expect(modal.getAction('Article.list')).to.be.a('function')
  modal.removeModal('Article')
  expect(modal.modals.Article).to.eql(undefined)
  expect(modal.getAction('Article.list')).to.eql(undefined)
})
