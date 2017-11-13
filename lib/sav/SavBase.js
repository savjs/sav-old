import {Router} from './Router.js'
import {ModalAction} from './ModalAction.js'
import {Schema} from './Schema.js'
import {Exception, HttpError} from './Exception.js'
import {compose} from './utils/compose.js'
import {bindEvent} from 'sav-util'

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
    this.invokeQueues = [invoke.bind(this)]
    this.composed = null
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
  declare ({actions, schemas, modals}) {
    if (schemas) {
      this.schema.declare(schemas)
    }
    if (modals) {
      this.router.declare(modals)
    }
    if (actions) {
      this.modalAction.declare(actions)
    }
  }
  compose () {
    return composeInvokes(this)
  }
  exec (ctx) {
    let {composed} = this
    if (!composed) {
      composed = this.composed = this.compose()
    }
    return composed(ctx)
  }
  before (fn) {
    this.invokeQueues.shift(fn)
  }
  after (fn) {
    this.invokeQueues.push(fn)
  }
}

function stripError (sav, error) {
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
  if (sav.opts.prod) {
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

function composeInvokes (sav) {
  let queues = compose(sav.invokeQueues)
  let schema = sav.schema.proxy
  return (ctx, next) => {
    Object.assign(ctx, {ctx, sav, schema, Exception, HttpError, argv: {}})
    return new Promise((resolve, reject) => {
      sav.prepare(ctx)
      return queues(ctx, () => {
        return sav.render(ctx)
      }).then(resolve).catch(reject)
    }).catch((err) => {
      ctx.argv.error = stripError(sav, err)
      return sav.render(ctx)
    })
  }
}

async function invoke ({ctx, argv, sav}, next) {
  let {schema} = sav
  let {route} = argv
  let reqStruct = schema.getSchema(route.request)
  if (reqStruct) {
    try {
      reqStruct.check(argv.input)
    } catch (err) {
      err.status = 400
      throw err
    }
  }
  argv.output = await sav.invoke(ctx)
  let resStruct = schema.getSchema(route.response)
  if (resStruct) {
    resStruct.check(argv.output)
  }
  return next()
}
