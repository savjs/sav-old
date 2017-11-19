import {Router} from './Router.js'
import {ModalAction} from './ModalAction.js'
import {Schema} from './Schema.js'
import {HttpError} from './Exception.js'
import {bindEvent, prop, isArray, isObject, isFunction} from 'sav-util'

export class SavBase {
  constructor (opts) {
    bindEvent(this)
    this.opts = {
      name: 'sav',
      prod: true
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modalAction = new ModalAction())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
    this.routes = {}
    this.router.on('declareAction', (route) => {
      if (route.actionName) {
        let name = route.name
        this.routes[name] = route
      }
    })
    this.mocks = {}
    this.init()
    this.setOptions(opts)
  }
  get name () {
    return this.opts.name
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  shareOptions (target) {
    target.opts = Object.assign(this.opts, target.opts)
  }
  declare ({actions, schemas, modals, mocks}) {
    if (schemas) {
      this.schema.declare(schemas)
    }
    if (modals) {
      this.router.declare(modals)
    }
    if (actions) {
      this.modalAction.declare(actions)
    }
    if (mocks) {
      Object.assign(this.mocks, mocks)
    }
  }
  resolvePayload (route) {
    let savRoute = this.routes[route.name]
    if (savRoute) {
      route.path = savRoute.compile(route.params)
      prop(route, 'route', savRoute)
      prop(route, 'savHandle', this)
      return route
    }
    let schema = this.schema.getSchema(route.name)
    if (schema) {
      let stateName = schema.opts.stateName || route.name
      route.state = {
        [`${stateName}`]: schema.create(schema.opts.state)
      }
      return route
    }
  }
  stripError (error) {
    let err
    if (error instanceof Error) {
      err = Object.assign({
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      }, error)
    } else if (typeof err !== 'object') {
      return error
    }
    if (this.opts.prod) {
      delete err.step
      delete err.stack
      delete err.stacks
    }
    if (!err.status) {
      if (!(error instanceof HttpError)) {
        err.status = 500
      }
    }
    return err
  }
  mapPayloadState (argv) {
    let {route, output} = argv
    let ret
    if (isObject(output)) {
      ret = mapping(argv, output) || mapping(route.action, output) || output
      let {resState} = route.action
      let name = resState || route.response
      if ((resState !== false) && name) {
        return {[`${name}`]: ret}
      }
    }
    return ret
  }
}

function mapping (target, output) {
  let {mapState} = target
  if (isArray(mapState)) {
    return mapState.reduce((ret, name) => {
      ret[name] = getStatePath(output, name)
    }, {})
  } else if (isObject(mapState)) {
    let ret = {}
    for (let name in mapState) {
      ret[name] = getStatePath(output, mapState[name])
    }
    return ret
  } else if (isFunction(mapState)) {
    return mapState(output)
  }
}

function getStatePath (output, stateName) {
  let pos = stateName.indexOf('.')
  while (pos !== -1) {
    output = output[stateName.substring(0, pos)]
    if (!isObject(output)) {
      return
    }
    stateName = stateName.substr(pos + 1)
    pos = stateName.indexOf('.')
  }
  return output[stateName]
}
