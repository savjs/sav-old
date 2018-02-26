import {Exception, HttpError} from './Exception.js'
import {prop} from 'sav-util'
import {HtmlRender} from './renders/HtmlRender.js'
import {VueRender} from './renders/VueRender.js'
import {SavBase} from './SavBase.js'
import {compose} from './utils/compose.js'

export class Sav extends SavBase {
  constructor (opts) {
    super(Object.assign({
      ssr: false,
      prod: process.env.NODE_ENV === 'production'
    }, opts))
  }
  init () {
    this.vueRender = new VueRender(this)
    this.renders = {
      html: new HtmlRender(this)
    }
    this.invokeQueues = [this.invoke]
    this.composed = null
  }
  before (fn) {
    this.invokeQueues.shift(fn)
  }
  after (fn) {
    this.invokeQueues.push(fn)
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
    let invoker = modalAction.getAction(mat.route.actionName)
    if (!invoker) {
      throw new HttpError(404)
    }
    prop(argv, 'invoker', invoker)
    argv.input = Object.assign({}, argv.params, ctx.query, mat.route.query, ctx.request.body)
  }
  async invoke ({ctx, argv, sav}, next) {
    let {schema} = sav
    let {route} = argv
    let reqStruct = schema.getSchema(route.request)
    if (reqStruct) {
      try {
        reqStruct.check(argv.input, {replace: true})
      } catch (err) {
        err.status = 400
        err.schema = reqStruct.name || reqStruct.id
        throw err
      }
    }
    argv.output = await argv.invoker.call(sav, ctx, argv)
    let resStruct = schema.getSchema(route.response)
    if (resStruct) {
      try {
        resStruct.check(argv.output)
      } catch (err) {
        err.status = 500
        err.schema = resStruct.name || resStruct.id
        throw err
      }
    }
    return next()
  }
  async invokePayload ({ctx, sav}, argv) {
    let {schema, modalAction} = sav
    let {route} = argv
    let invoker = modalAction.getAction(route.actionName)
    let isApi = route.api !== false
    if (!invoker && isApi) {
      throw new HttpError(404)
    }
    let reqStruct = schema.getSchema(route.request)
    argv.input = Object.assign({}, argv.params, ctx.query, argv.query, argv.data)
    if (reqStruct) {
      try {
        reqStruct.check(argv.input, {replace: true})
      } catch (err) {
        err.status = 400
        throw err
      }
    }
    if (isApi) {
      let output = argv.output = await invoker.call(sav, ctx, argv)
      let resStruct = schema.getSchema(route.response)
      if (resStruct) {
        resStruct.check(output)
      }
    }
    return this.mapPayloadState(argv)
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
      } else {
        ctx.status = 200
      }
      ctx.body = argv.state
    }
  }
}

function isClientView (route) {
  if (route.modal.view) {
    return route.action.view || (route.action.view !== false)
  }
  return !!route.action.view
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
      ctx.argv.error = sav.stripError(err)
      return sav.render(ctx)
    })
  }
}
