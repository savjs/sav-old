import path from 'path'
import {noticeString, ensureDir, outputFile, pathExists} from '../util.js'
import {hyphenCase} from 'sav-util'

export function writeSass (dir, modals, {pageMode = true, pagePrefix = 'page', force = true}) {
  let opts = {
    pageMode,
    pagePrefix,
    force
  }
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .filter(modalName => modalFilter(modals[modalName], opts))
    .map((modalName) => writeSassFile(dir, modalName, modals[modalName], opts)))
    .then((args) => updateIndex(dir, args, opts)))
}

function modalFilter (modal, opts) {
  // modal 被定义为 view 类型的 modal
  if (modal.view) {
    return true
  }
  if (modal.routes.filter(it => it.view).length) {
    return true
  }
}

function routeFilter (modal, route) {
  if (modal.view) {
    return !(route.view === false || Number(route.view) === 0)
  }
  return !!route.view
}

async function writeSassFile (dir, modalName, modal, opts) {
  modalName = hyphenCase(modalName)
  let paths = []
  let pageFile = `_${modalName}.sass`
  paths.push(pageFile)
  let pagePath = path.resolve(dir, pageFile)
  let pageText = `// .${opts.pagePrefix}-${modalName}\n\n`
  if (opts.pageMode) {
    pageText += Object.keys(modal.routes)
      .filter(routeName => routeFilter(modal, modal.routes[routeName]))
      .map((routeName) => `// .${modalName}-${hyphenCase(routeName)}`).join('\n\n')
  } else {
    for (let routeName in modal.routes) {
      if (routeFilter(modal, modal.routes[routeName])) {
        routeName = hyphenCase(routeName)
        let viewFile = `_${modalName}-${routeName}.sass`
        paths.push(viewFile)
        let viewPath = path.resolve(dir, viewFile)
        if (opts.force || !await pathExists(viewPath)) {
          await outputFile(viewPath, `${noticeString}// .${modalName}-${routeName}`)
        }
      }
    }
  }
  if (opts.force || !await pathExists(pagePath)) {
    await outputFile(pagePath, `${noticeString}${pageText}`)
  }
  return paths
}

async function updateIndex (dir, args, opts) {
  let files = args.reduce((a, b) => a.concat(b), [])
  let pageText = `${noticeString}${files.map(it => `@import '${it}'`).join('\n')}`
  await outputFile(path.resolve(dir, `_all.sass`), pageText)
}
