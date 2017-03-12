import test from 'ava'
import {expect} from 'chai'

import {viewPlugin, view, Router, get, gen, props} from 'sav-core'
import path from 'path'

test('api', (ava) => {
  expect(viewPlugin).to.be.a('function')
  expect(view).to.be.a('function')
})

test('module.view', (ava) => {
  @gen
  @props({
    view: true
  })
  class Test {
    @view()
    viewFile1 () {}

    @view(false)
    viewFile3 () {}

    @view('about-blank')
    viewFile5 () {}

    @view({})
    viewFile6 () {}

    @view({
      file: 'user-view'
    })
    viewFile7 () {}

    @get()
    viewFile8 () {}
  }

  let router = new Router()
  router.use(viewPlugin)
  router.declare(Test)
  expect(path.basename(Test.actions.viewFile1.view.relativeViewFile)).to.eql('view_file1')
  expect(Test.actions.viewFile3.view).to.eql(undefined)
  expect(path.basename(Test.actions.viewFile5.view.relativeViewFile)).to.eql('about-blank')
  expect(path.basename(Test.actions.viewFile6.view.relativeViewFile)).to.eql('view_file6')
  expect(path.basename(Test.actions.viewFile7.view.relativeViewFile)).to.eql('user-view')
  expect(path.basename(Test.actions.viewFile8.view.relativeViewFile)).to.eql('view_file8')
})

test('module.view.string', (ava) => {
  @gen
  @props({
    view: 'test'
  })
  class Test {
    @view()
    viewFile1 () {}

    @get()
    viewFile8 () {}
  }

  let router = new Router()
  router.use(viewPlugin)
  router.declare(Test)
  expect(path.basename(Test.actions.viewFile1.view.relativeViewFile)).to.eql('view_file1')
  expect(path.basename(Test.actions.viewFile8.view.relativeViewFile)).to.eql('view_file8')
})

test('action.view', (ava) => {
  @gen
  class Test {
    @view()
    viewFile1 () {}

    @view(false)
    viewFile3 () {}

    @view('about-blank')
    viewFile5 () {}

    @view({})
    viewFile6 () {}

    @view({
      file: 'user-view'
    })
    viewFile7 () {}

    @get()
    viewFile8 () {}
  }

  let router = new Router()
  router.use(viewPlugin)
  router.declare(Test)
  expect(path.basename(Test.actions.viewFile1.view.relativeViewFile)).to.eql('view_file1')
  expect(Test.actions.viewFile3.view).to.eql(undefined)
  expect(path.basename(Test.actions.viewFile5.view.relativeViewFile)).to.eql('about-blank')
  expect(path.basename(Test.actions.viewFile6.view.relativeViewFile)).to.eql('view_file6')
  expect(path.basename(Test.actions.viewFile7.view.relativeViewFile)).to.eql('user-view')
  expect(Test.actions.viewFile8.view).to.eql(undefined)
})

test('action.absoluteViewFile', (ava) => {
  @gen
  @props({
    view: 'fixtures'
  })
  class Test {
    @get()
    basic () {}

    @view('basic.hbs')
    hbs () {}

    @view('')
    dir () {}
  }
  let router = new Router({
    viewRoot: __dirname
  })

  router.use(viewPlugin)
  router.declare(Test)

  expect(Test.actions.basic.view.absoluteViewFile).to.eql(path.resolve(__dirname, 'fixtures/basic.html'))
  expect(Test.actions.basic.view.viewFileExt).to.eql('html')

  expect(Test.actions.hbs.view.absoluteViewFile).to.eql(path.resolve(__dirname, 'fixtures/basic.hbs'))
  expect(Test.actions.hbs.view.viewFileExt).to.eql('hbs')

  expect(Test.actions.dir.view.absoluteViewFile).to.eql(path.resolve(__dirname, 'fixtures/index.html'))
  expect(Test.actions.dir.view.viewFileExt).to.eql('html')
})
