/**
 * 生成 sass 目录的内容
 */

import path from 'path'
import {noticeString, ensureDir, inputFile, outputFile, pathExists, isClientView, isClientRouter} from '../util.js'
import {hyphenCase} from 'sav-util'

export function writeSass (dir, modals, options) {
  let opts = Object.assign({
    mode: 'app',
    pagePrefix: 'page',
    force: false
  }, options)
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
  if (opts.mode === 'modal') {
    pageText += Object.keys(modal.routes)
      .filter(routeName => isClientRouter(modal, modal.routes[routeName]))
      .map((routeName) => `// .${modalName}-${hyphenCase(routeName)}`).join('\n\n')
  } else if (opts.mode === 'action'){
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
  } else {
    return []
  }
  if (opts.force || !await pathExists(pagePath)) {
    await outputFile(pagePath, `${noticeString}${pageText}`)
  }
  return paths
}

async function updateIndex (dir, args, opts) {
  let files = args.reduce((a, b) => a.concat(b), [])
  let pageText = `${noticeString}${files.map(it => `@import '${it}'`).join('\n')}`
  let allSass = path.resolve(dir, `_all.sass`)
  if (await pathExists(allSass)) {
    let oldText = await inputFile(allSass)
    if (oldText.toString() !== pageText) {
      await outputFile(allSass, pageText)
    }
  } else {
    await outputFile(allSass, pageText)
  }
  let appFile = path.resolve(dir, `app.sass`)
  if (!await pathExists(appFile)) {
    await outputFile(appFile, `${noticeString}@import _all.sass`)
  }
}
