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
  savPhpRoutes(dir, data.modals)

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
}

async function savPhpRoutes (dir, modals) {
  await ensureDir(dir)
  let router = new Router()
  router.declare(modals)
  let routeLists = {
    groups: await Promise.all(router.modalRoutes.map(async (modalRoute) => {
      for (let method in modalRoute.routes) {
        if (modalRoute.routes[method].length) {
          modalRoute.routes[method].forEach((route) => {
            if (isRegPath(route.path)) {
              let keys = route.keys.map((it) => it.name).join(',')
              route.action.regexp = route.regexp.toString()
              if (keys.length) {
                route.action.keys = keys
              }
            }
            delete route.action.name
          })
        }
      }
      let ret = {
        name: modalRoute.name
      }
      if (isRegPath(modalRoute.path)) {
        ret.regexp = modalRoute.regexp.toString()
        let keys = modalRoute.keys.map((it) => it.name).join(',')
        if (keys.length) {
          ret.keys = keys
        }
      } else {
        ret.path = modalRoute.path
      }
      delete modalRoute.modal.name
      return ret
    }))
  }

  for (let method in router.actionRoutes) {
    if (router.actionRoutes[method].length) {
      let res = []
      router.actionRoutes[method].forEach((route) => {
        let rt = {
          name: route.actionName
        }
        if (isRegPath(route.path)) {
          rt.regexp = route.regexp.toString()
          let keys = route.keys.map((it) => it.name).join(',')
          if (keys.length) {
            rt.keys = keys
          }
        } else {
          rt.path = route.path
        }
        route.action.abs = true
        delete route.action.name
        res.push(rt)
      })
      routeLists[method.toLowerCase()] = res
    }
  }

  let phpData = jsonar.arrify(routeLists, { prettify: true, indent: 2, space: true })
  phpData = `<?PHP\n${noticeString}return ${phpData}\n`
  await outputFile(path.resolve(dir, `routes.php`), phpData)
}

function isRegPath (path) {
  return typeof path === 'string' && (
    (path.indexOf(':') !== -1) || (path.indexOf('(') !== -1)
  )
}
