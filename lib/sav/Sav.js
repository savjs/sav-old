import EventEmitter from 'events'
import {Router} from './Router.js'
import {Modal} from './Modal.js'
import {Schema} from './Schema.js'
import {HttpError} from './HttpError.js'
import {compose} from './utils/compose.js'
import {prop} from 'sav-util'

export class Sav extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {
      indexTemplate: 'index.html',
      errorTemplate: 'error.html'
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modal = new Modal())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
    this.invokeQueues = [invoke.bind(this)]
    Object.assign(this.opts, opts)
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
    if (actions) {
      this.router.declare(actions)
    }
    if (modals) {
      this.modal.declare(modals)
    }
  }
  compose () {
    return composeInvokes(this)
  }
}

function match ({router, modal}, ctx) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let mat = router.matchRoute(path, method)
  if (!mat) {
    throw new HttpError(404)
  }
  let argv = Object.assign(ctx.argv, mat)
  let action = modal.getAction(mat.route.actionName)
  if (!action) {
    throw new HttpError(404)
  }
  prop(argv, 'action', action)
}

function invoke (ctx, next) {
  let {schema} = this
  let {argv} = ctx
  let {route, action} = argv
  let reqStruct = schema.getSchema(route.request)
  argv.input = Object.assign({}, argv.params, ctx.query, ctx.request.body)
  if (reqStruct) {
    reqStruct.check(argv.input)
  }
  argv.output = action.call(this, ctx, argv)
  let resStruct = schema.getSchema(route.response)
  if (resStruct) {
    resStruct.check(argv.output)
  }
  return next()
}

function composeInvokes (sav) {
  let queues = compose(sav.invokeQueues)
  return (ctx, next) => {
    prop(ctx, 'sav', sav)
    prop(ctx, 'ctx', ctx)
    prop(ctx, 'argv', {})
    return new Promise((resolve, reject) => {
      if (match(sav, ctx)) {
        return queues(ctx, () => {
          return render(ctx, sav)
        }).then(resolve).catch(reject)
      }
      return reject(new HttpError(404))
    }).catch((err) => {
      ctx.argv.error = err
      return render(ctx, sav)
    })
  }
}

function render (ctx, sav) {

}
