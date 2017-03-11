import {quickConf} from 'sav-decorator'
import {convertCase} from 'sav-router'
import {resolve, extname, join} from 'path'
import {existsSync, statSync} from 'fs'
import consolidate from 'consolidate'

export const view = quickConf('view')

const ERR_ACCESS_FAIL = '[view] template can not be accessed :'

export function viewPlugin (ctx) {
  let viewRoot = ctx.config('viewRoot') || '.'
  let viewCase = ctx.config('viewCase') || 'snake'
  let viewExtension = ctx.config('viewExtension') || 'html'
  let viewEngines = {
    html: 'htmling',
    ...ctx.config('viewEngines')
  }
  // let viewOpts = ctx.config('view_opts')

  ctx.use({
    async payload (context, next) {
      context.view = (template, data) => {
        context._view = template && {
          template,
          data
        }
      }
      let render = async (template, data) => {
        let $view = context.$view || {}
        if (template) {
          $view.ensure = true
          $view.relativeViewFile = template
          let file = accessFile(viewRoot, template, viewExtension)
          if (file) {
            $view.absoluteViewFile = file.filePath
            $view.viewFileExt = file.fileExt
          }
        } else if (!context.$view) {
          return
        }
        if (!$view.absoluteViewFile) {
          if ($view.ensure) {
            throw new Error(`${ERR_ACCESS_FAIL} ${$view.relativeViewFile}`)
          }
        }
        let engine = viewEngines[$view.viewFileExt] || $view.viewFileExt
        let typeValue = typeof engine
        if (typeValue === 'string') {
          engine = consolidate[engine]
        } else if (typeValue === 'function') {
          let ret = engine(context)
          if (ret && ret.then) {
            ret = await ret
          }
          engine = ret
        }
        if (!engine) {
          throw new Error(`[view] Engine not found for "${$view.absoluteViewFile}"`)
        }
        let state = {
          ...context.state,
          ...data
          // viewOpts,
        }
        let ret = await engine($view.absoluteViewFile, state)
        context.end(ret)
      }
      await next()
      if (context._view) {
        await render(context._view.template, context._view.data)
      } else {
        await render()
      }
    },
    module (module, {ctx}) {
      let {view: viewPath, viewLayout, viewExtension: viewExt} = module.props

      module.viewFileExt = viewExt || viewExtension

      // calc module viewPath
      if (viewPath) {
        if (typeof viewPath !== 'string') {
          viewPath = convertCase(viewCase, module.name)
        }
        module.viewPath = viewPath
      }
      // calc module viewLayout
      if (viewLayout) {
        if (typeof viewLayout !== 'string') {
          viewLayout = viewPath || convertCase(viewCase, module.name)
        }
        module.relativeViewFile = viewLayout
        let file = accessFile(viewRoot, viewLayout, viewExt || viewExtension)
        if (file) {
          module.absoluteViewFile = file.filePath
          module.viewFileExt = file.fileExt
        } else {
          ctx.warn(`${ERR_ACCESS_FAIL} ${viewLayout}`)
        }
        module.viewLayout = viewLayout
      }
      if (viewPath || viewLayout) {
        // auto append view middleware
        for (let actionName in module.actions) {
          let action = module.actions[actionName]
          let found = false
          for (let middleware of action.middleware) {
            if (middleware[0] === 'view') {
              found = true
            }
          }
          if (!found) { // append as last
            action.middleware.push(['view'])
          }
        }
      }
    },
    middleware ({name, args}, {ctx, module, action, middlewares}) {
      if (name !== 'view') {
        return
      }
      let viewPath = args[0]
      if (viewPath === false) {
        return
      }
      let viewOpts
      if (viewPath === undefined) {
        viewPath = convertCase(viewCase, action.name)
      } else if (typeof viewPath === 'object') {
        viewOpts = viewPath
        viewPath = viewOpts.path || convertCase(viewCase, action.name)
      }
      let $view
      if (module.viewLayout) { // use layout to render
        $view = {
          ensure: true,
          relativeViewFile: module.relativeViewFile,
          absoluteViewFile: module.absoluteViewFile,
          viewFileExt: module.viewFileExt,
          options: {...viewOpts}
        }
      } else {
        let relativeViewFile = join(module.viewPath || '', viewPath)
        action.relativeViewFile = relativeViewFile
        let file = accessFile(viewRoot, relativeViewFile, module.viewFileExt)
        if (file) {
          action.absoluteViewFile = file.filePath
          action.viewFileExt = file.fileExt
        } else {
          ctx.warn(`${ERR_ACCESS_FAIL} ${relativeViewFile}`)
        }
        $view = {
          ensure: true,
          relativeViewFile,
          absoluteViewFile: action.absoluteViewFile,
          viewFileExt: action.viewFileExt,
          options: {...viewOpts}
        }
      }
      middlewares.push(async (ctx) => {
        ctx.$view = {...$view}
      })
    }
  })
}

function accessFile (viewRoot, relativeViewFile, viewExtension) {
  let filePath
  let stats
  if (existsSync(filePath = resolve(viewRoot, relativeViewFile))) {
    stats = statFile(filePath)
    if (!stats) {
      filePath = resolve(viewRoot, relativeViewFile, `index.${viewExtension}`)
      stats = statFile(filePath)
    }
  } else if (existsSync(filePath = resolve(viewRoot, `${relativeViewFile}.${viewExtension}`))) {
    stats = statFile(filePath)
  }
  if (stats) {
    let fileExt = extname(filePath)
    fileExt = fileExt.substr(1, fileExt.length)
    return {filePath, fileExt}
  }
}

function statFile (filePath) {
  try {
    let stats = statSync(filePath)
    if (stats.isFile()) {
      return stats
    }
  } finally {

  }
}
