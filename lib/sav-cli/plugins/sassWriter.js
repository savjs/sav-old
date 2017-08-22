import path from 'path'
import {noticeString, ensureDir, outputFile, pathExists, isClientView, isClientRouter} from '../util.js'
import {hyphenCase} from 'sav-util'

export function writeSass (dir, modals, {pageMode = true, pagePrefix = 'page', force = false}) {
  let opts = {
    pageMode,
    pagePrefix,
    force
  }
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .filter(modalName => isClientView(modals[modalName], opts))
    .map((modalName) => writeSassFile(dir, modalName, modals[modalName], opts)))
    .then((args) => updateIndex(dir, args, opts)))
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
      .filter(routeName => isClientRouter(modal, modal.routes[routeName]))
      .map((routeName) => `// .${modalName}-${hyphenCase(routeName)}`).join('\n\n')
  } else {
    for (let routeName in modal.routes) {
      if (isClientRouter(modal, modal.routes[routeName])) {
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
