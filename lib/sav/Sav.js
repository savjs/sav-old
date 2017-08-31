import EventEmitter from 'events'
import {Router} from './Router.js'
import {Modal} from './Modal.js'
import {Schema} from './Schema.js'
import {Exception, HttpError} from './Exception.js'
import {compose} from './utils/compose.js'
import {prop} from 'sav-util'
import {JsonRender} from './renders/JsonRender.js'
import {HtmlRender} from './renders/HtmlRender.js'

export class Sav extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {
      rootPath: '.',
      staticPath: './static',
      prod: process.env.NODE_ENV === 'production'
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modal = new Modal())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
    this.invokeQueues = [invoke.bind(this)]
    this.renders = {
      json: new JsonRender(this),
      html: new HtmlRender(this)
    }
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
  stripError (error) {
    let err
    if (error instanceof Error) {
      err = error.toJSON()
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
}

function match ({ctx, method, path, originalUrl, argv}, {router, modal}) {
  let accept = ctx.accepts(['html', 'json'])
  if (accept) {
    argv.accept = accept
  }
  let uri = path || originalUrl
  let mat = router.matchRoute(uri, method.toUpperCase())
  if (!mat) {
    throw new HttpError(404)
  }
  Object.assign(argv, mat)
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
    Object.assign(ctx, {ctx, sav, Exception, HttpError, argv: {}})
    return new Promise((resolve, reject) => {
      match(ctx, sav)
      return queues(ctx, () => {
        return render(ctx, sav)
      }).then(resolve).catch(reject)
    }).catch((err) => {
      ctx.argv.error = err
      return render(ctx, sav)
    })
  }
}

function render ({ctx, argv}, sav) {
  let render = sav.renders[argv.accept]
  if (render) {
    return render.render(ctx)
  } else {
    if (argv.error) {
      ctx.body = sav.stripError(argv.error)
    } else {
      ctx.body = argv.output
    }
  }
}
