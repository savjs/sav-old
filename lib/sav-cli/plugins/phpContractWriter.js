/**
 * 生成 contract 目录的内容
 */
import {Router} from '../../sav/Router.js'
import {Schema} from '../../sav/Schema.js'
import path from 'path'
// import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile} from '../util.js'
import jsonar from 'jsonar'

export function writePhpContract (dir, data) {
  return savPhpContract(dir, data)
}

async function savPhpContract (dir, data) {
  await ensureDir(dir)
  let router = new Router()
  let schema = new Schema()
  schema.setRouter(router)

  savPhpRoutes(router, dir, data.modals)

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

async function savPhpRoutes (router, dir, modals) {
  await ensureDir(dir)
  router.declare(modals)
  let routeLists = {
    GROUPS: await Promise.all(router.modalRoutes.map(async (modalRoute) => {
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
        ret.uri = modalRoute.path
      }
      delete modalRoute.modal.name
      for (let method in modalRoute.routes) {
        if (modalRoute.routes[method].length) {
          modalRoute.routes[method].forEach((route) => {
            if (ret.regexp || isRegPath(route.path)) { // 正则模式
              let keys = route.keys.map((it) => it.name).join(',')
              route.action.regexp = route.regexp.toString()
              if (keys.length) {
                route.action.keys = keys
              }
            } else { // 路径模式
              route.action.uri = route.path
            }
            normalRouteAction(route, false)
          })
        }
      }
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
          rt.uri = route.path
        }
        normalRouteAction(route, true)
        res.push(rt)
      })
      routeLists[method.toUpperCase()] = res
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

function normalRouteAction (route, abs) {
  delete route.action.name
  delete route.action.path
  delete route.action.component
  if (abs) {
    route.action.abs = true
  }
  // 把request和response提取出来?
}
