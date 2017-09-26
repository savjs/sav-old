import EventEmitter from 'events'
import {Router} from './Router.js'
import {ModalAction} from './ModalAction.js'
import {Schema} from './Schema.js'
import {Exception, HttpError} from './Exception.js'
import {compose} from './utils/compose.js'
import {prop, isFunction, isObject} from 'sav-util'
import {HtmlRender} from './renders/HtmlRender.js'
import {VueRender} from './renders/VueRender.js'

export class Sav extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = {
      rootPath: '.',
      ssr: false,
      prod: process.env.NODE_ENV === 'production'
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modalAction = new ModalAction())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
    this.invokeQueues = [invoke.bind(this)]
    let vueRender = this.vueRender = new VueRender(this)
    vueRender.invokePayloads = invokePayloads
    this.renders = {
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
}

function stripError (sav, error) {
  let err
  if (error instanceof Error) {
    err = toJSON(error)
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
  argv.input = Object.assign({}, argv.params, route.query, ctx.request.body)
  if (reqStruct) {
    try {
      reqStruct.check(argv.input)
    } catch (err) {
      err.status = 400
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

function invokePayloads (sav, ctx, vueRoute, vueRouter, payloads) {
  let routes = payloads.reduce((routes, payload) => {
    if (isFunction(payload)) {
      payload = payload(vueRoute)
    }
    if (Array.isArray(payload) || isObject(payload)) {
      return routes.concat(payload)
    }
    return routes
  }, []).filter((it) => {
    if (isObject(it)) {
      return it.path !== vueRoute.path
    }
  }).map((route) => {
    if (route.name && !route.fullPath) {
      return vueRouter.resolve(route)
    }
    return route
  })
  return Promise.all(routes.map((route) => invokePayload(sav, ctx, route)))
    .then((args) => {
      return Object.assign.apply({}, args)
    })
}

async function invokePayload (sav, ctx, {path, query}) {
  let {router, schema, modalAction} = sav
  let argv = router.matchRoute(path, 'GET')
  if (!argv) {
    throw new HttpError(404)
  }
  let {route, params} = argv
  let action = modalAction.getAction(route.actionName)
  if (!action) {
    throw new HttpError(404)
  }
  let reqStruct = schema.getSchema(route.request)
  argv.input = Object.assign({}, params, route.query, query)
  if (reqStruct) {
    try {
      reqStruct.check(argv.input)
    } catch (err) {
      err.status = 400
      throw err
    }
  }
  let output = await action.call(sav, ctx, argv)
  let resStruct = schema.getSchema(route.response)
  if (resStruct) {
    resStruct.check(output)
  }
  return output
}

function composeInvokes (sav) {
  let queues = compose(sav.invokeQueues)
  let schema = sav.schema.proxy
  return (ctx, next) => {
    Object.assign(ctx, {
      ctx,
      sav,
      schema,
      Exception,
      HttpError,
      argv: {
        path: ctx.path || ctx.originalUrl
      }
    })
    return new Promise((resolve, reject) => {
      match(ctx, sav)
      return queues(ctx, () => {
        return render(ctx, sav)
      }).then(resolve).catch(reject)
    }).catch((err) => {
      ctx.argv.error = stripError(sav, err)
      return render(ctx, sav)
    })
  }
}

function render ({ctx, argv}, sav) {
  argv.state = argv.error ? {error: argv.error} : argv.output
  let render = sav.renders[argv.accept]
  if (sav.opts.ssr && argv.accept === 'html') {
    if (argv.route && isClientView(argv.route)) {
      let mat = sav.vueRender.match(ctx)
      if (mat) {
        return sav.vueRender.render(ctx, mat)
      }
    }
  }
  if (render) {
    return render.render(ctx)
  } else {
    if (argv.error) {
      ctx.status = argv.error.status
    }
    ctx.body = argv.state
  }
}

function isClientView (route) {
  if (route.modal.view) {
    return route.action.view || (route.action.view !== false)
  }
  return !!route.action.view
}
