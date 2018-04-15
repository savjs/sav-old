import {Router} from 'sav-router'
import {Schema} from 'sav-schema'
import {testAssign, bindEvent, isArray, isObject, isFunction, pascalCase} from 'sav-util'
import {HttpError} from './Exception.js'

export class Contract {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      strict: true,
      contract: null,
    })
    this.router = new Router(this.opts)
    this.schema = new Schema(this.opts)
    this.routes = {}
    this.mocks = {}
    bindEvent(this)
    if (this.opts.contract) {
      this.load(this.opts.contract)
    }
  }
  get projectName () {
    return this.project.name
  }
  load (data) {
    let {project, mocks} = data
    this.schema.load(data)
    this.router.load(data)
    if (mocks) {
      mocks.forEach(mock => {
        if (mock.req) { // 不处理req, 只处理res
          return
        }
        let name = pascalCase(mock.modalName + '_' + mock.actionName)
        let datas = this.mocks[name] || (this.mocks[name] = [])
        datas.push(mock)
      })
    }
    if (project) {
      this.project = project
    }
  }
  matchRoute (path, method, merge) {
    let route = this.router.matchRoute(path, method)
    if (!route) {
      throw new HttpError(404)
    }
    route.input = Object.assign({}, merge, route.params)
    return route
  }
  checkInput (route, input) {
    let reqStruct = this.schema.getSchema(route.request)
    if (reqStruct) {
      try {
        reqStruct.check(input, {replace: true})
      } catch (err) {
        err.status = 400
        err.schema = reqStruct.name || reqStruct.id
        throw err
      }
    }
  }
  checkOutput (route, output) {
    let resStruct = this.schema.getSchema(route.response)
    if (resStruct) {
      try {
        resStruct.check(output)
      } catch (err) {
        err.status = 500
        err.schema = resStruct.name || resStruct.id
        throw err
      }
    }
  }
}
