/**
 * 生成 contract 目录的内容
 */
import {Router} from '../../sav/Router.js'
import path from 'path'
// import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile} from '../util.js'
import jsonar from 'jsonar'

export function writePhpContract (dir, data) {
  return savPhpContract(dir, data)
}

async function savPhpContract (dir, data) {
  await ensureDir(dir)
  for (let name in data) {
    let mods = data[name]
    let modsDir = path.resolve(dir, name)
    await ensureDir(modsDir)
    for (let modName in mods) {
      let mod = mods[modName]
      let phpData = jsonar.arrify(mod, { prettify: true, indent: 2, space: true })
      phpData = `<?PHP\n${noticeString}return ${phpData}\n`
      await outputFile(path.resolve(modsDir, `${modName}.php`), phpData)
    }
  }
  let router = new Router()
  router.declare(data.modals)
  let routes = {
    // groups: router.modalRoutes
  }

  for (let method in router.actionRoutes) {
    if (router.actionRoutes[method].length) {
      let ret = {}
      router.actionRoutes[method].forEach((route) => {
        ret[route.actionName] = route.regexp.source
      })
      routes[method.toLowerCase()] = ret
    }
  }

  let phpData = jsonar.arrify(routes, { prettify: true, indent: 2, space: true })
  phpData = `<?PHP\n${noticeString}return ${phpData}\n`
  await outputFile(path.resolve(dir, `router.php`), phpData)
}
