import {quickConf} from '../decorator'
import {convertCase} from '../utils/convert'
import {resolve, extname, join} from 'path'
import {existsSync, statSync} from 'fs'
import consolidate from 'consolidate'
import {isAsync, isPromise, isString, isFunction} from '../utils/type'

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

        if (isString(engine)) {
          engine = consolidate[engine]
        } else if (isFunction(engine)) {
          let ret
          if (isAsync(engine)) {
            ret = await engine(context)
          } else {
            ret = engine(context)
            if (isPromise(ret)) {
              ret = await ret
            }
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
    module (module) {
      // 生成module的view数据
      let {view: viewDirectory, viewFile, viewExtension: viewExt} = module.props
      let viewData = module.view = createViewData({
        viewFileExt: viewExt || viewExtension
      })
      // calc module viewDirectory
      if (viewDirectory) {
        if (viewDirectory === true) { // 使用模块名称当作目录
          viewDirectory = convertCase(viewCase, module.moduleName)
        }
        viewData.viewDirectory = viewDirectory
      }
      // calc module viewFile
      if (viewFile) {
        if (viewFile === true) { // 使用模块名称当作目录
          viewFile = viewDirectory || convertCase(viewCase, module.moduleName)
        }
        viewData.relativeViewFile = viewFile
        let file = accessFile(viewRoot, viewFile, viewExt || viewExtension)
        if (file) {
          viewData.absoluteViewFile = file.filePath
          viewData.viewFileExt = file.fileExt
        } else {
          ctx.warn(`${ERR_ACCESS_FAIL} ${viewFile}`)
        }
      }
      if (viewDirectory || viewFile) {
        viewData.ensure = true
      }
    },
    action (action) {
      let {module} = action
      let moduleView = module.view
      if (!(moduleView.ensure || action.props.view)) {
        return
      }
      let args = action.props.view || []
      let viewFile = args[0]
      if (viewFile === false) {
        return
      }
      let viewOpts
      if (viewFile === undefined) { // 默认文件
        viewFile = convertCase(viewCase, action.actionName)
      } else if (typeof viewFile === 'object') { // 使用对象方式
        viewOpts = viewFile
        viewFile = viewOpts.file || convertCase(viewCase, action.actionName)
      }
      let view
      if (moduleView.relativeViewFile) { // module指定渲染文件
        view = createViewData(Object.assign({}, moduleView, {ensure: true}, viewOpts))
      } else { // action指定渲染文件
        let relativeViewFile = join(moduleView.viewDirectory || '', viewFile)
        view = {
          ensure: true,
          relativeViewFile
        }
        let file = accessFile(viewRoot, relativeViewFile, moduleView.viewFileExt)
        if (file) {
          view.absoluteViewFile = file.filePath
          view.viewFileExt = file.fileExt
        } else {
          ctx.warn(`${ERR_ACCESS_FAIL} ${relativeViewFile}`)
        }
        view = createViewData(Object.assign(view, viewOpts))
      }
      // 生成action的view数据
      action.view = view
      action.set('view', (ctx) => {
        ctx.$view = {...action.view}
      })
    }
  })
}

function createViewData (props) {
  return Object.assign({
    ensure: false,          // 是否需要渲染view
    viewFileExt: null,      // view的文件扩展名
    viewDirectory: null,    // 目录
    relativeViewFile: null, // 文件
    absoluteViewFile: null  // 渲染文件的绝对路径
  }, props)
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
