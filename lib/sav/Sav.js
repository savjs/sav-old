import EventEmitter from 'events'
import {Router} from './Router.js'
import {ModalAction} from './ModalAction.js'
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
      prod: process.env.NODE_ENV === 'production'
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modalAction = new ModalAction())
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
  stripError (error) {
    let err
    if (error instanceof Error) {
      err = toJSON(error)
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

function toJSON (error) {
  return Object.assign({
    message: error.message,
    type: error.constructor.name,
    stack: error.stack
  }, error)
}

function match ({ctx, method, path, originalUrl, argv}, {router, modalAction}) {
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
  let action = modalAction.getAction(mat.route.actionName)
  if (!action) {
    throw new HttpError(404)
  }
  prop(argv, 'action', action)
}

async function invoke (ctx, next) {
  let {schema} = this
  let {argv} = ctx
  let {route, action} = argv
  let reqStruct = schema.getSchema(route.request)
  argv.input = Object.assign({}, argv.params, ctx.query, ctx.request.body)
  if (reqStruct) {
    try {
      reqStruct.check(argv.input)
    } catch (err) {
      err.status = 403
      throw err
    }
  }
  argv.output = await action.call(this, ctx, argv)
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
