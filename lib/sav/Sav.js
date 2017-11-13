import {HttpError} from './Exception.js'
import {prop, isFunction, isObject} from 'sav-util'
import {HtmlRender} from './renders/HtmlRender.js'
import {VueRender} from './renders/VueRender.js'
import {SavBase} from './SavBase.js'

export class Sav extends SavBase {
  constructor (opts) {
    super(Object.assign({
      ssr: false,
      prod: process.env.NODE_ENV === 'production'
    }, opts))
  }
  init () {
    let vueRender = this.vueRender = new VueRender(this)
    vueRender.invokePayloads = invokePayloads
    this.renders = {
      html: new HtmlRender(this)
    }
  }
  prepare ({ctx, argv, sav}) {
    let {router, modalAction} = sav
    let url = ctx.path || ctx.originalUrl
    let accept = ctx.accepts(['html', 'json'])
    if (accept) {
      argv.accept = accept
    }
    let mat = router.matchRoute(url, ctx.method.toUpperCase())
    if (!mat) {
      throw new HttpError(404)
    }
    Object.assign(argv, mat)
    let action = modalAction.getAction(mat.route.actionName)
    if (!action) {
      throw new HttpError(404)
    }
    prop(argv, 'action', action)
    argv.input = Object.assign({}, argv.params, mat.route.query, ctx.request.body)
  }
  invoke ({ctx, argv, sav}) {
    return argv.action.call(sav, ctx, argv)
  }
  render ({ctx, argv, sav}) {
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
        if (argv.error.status) {
          ctx.status = argv.error.status
        }
      }
      ctx.body = argv.state
    }
  }
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
      return args.length ? Object.assign.apply({}, args) : {}
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

function isClientView (route) {
  if (route.modal.view) {
    return route.action.view || (route.action.view !== false)
  }
  return !!route.action.view
}
