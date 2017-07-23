import {resolve, extname, basename} from 'path'
import {readdirAsync, readFileAsync} from '../sav/util/file.js'
import {prop} from 'sav-util'
import {decoratorFileAsync} from './decorator.js'
import {convertFunctionToName} from './sav/util/helper.js'

export async function loadConstractDir (path) {
  let group = {}
  await Promise.all((await readdirAsync(path)).map(async (dirName) => {
    let modal = group[dirName] = {}
    let files = await readdirAsync(resolve(path, dirName))
    files.forEach((name) => {
      let file = resolve(path, dirName, name)
      let ext = extname(name)
      let baseName = basename(name, ext)
      if (baseName !== 'index') {
        let curr = modal[baseName] || (modal[baseName] = {})
        if (ext === '.js') {
          prop(curr, 'js', file)
        } else if (ext === '.json') {
          prop(curr, 'json', file)
        }
      }
    })
  }))
  return group
}

export async function loadConstractModals (path) {
  let groups = await loadConstractDir(path)
  for (let modalGroup in groups) {
    let group = groups[modalGroup]
    for (let modalName in group) {
      let modal = group[modalName]
      let content
      if (modal.js) { // 装饰器转成JSON
        // schema 中的函数转成函数名称
        content = convertFunctionToName(await decoratorFileAsync(modal.js))
      } else if (modal.json) { // 直接读取json文件
        content = JSON.parse(await readFileAsync(modal.json))
      }
      group[modalName] = Object.assign({}, content, modal)
    }
  }
  return groups
}
