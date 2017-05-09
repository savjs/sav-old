import {resolve, extname, basename} from 'path'
import {readdirAsync} from '../sav/util/file.js'
import {decoratorFileAsync} from './decorator.js'
import {Contract} from '../sav/modal/contract.js'

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
          curr.js = file
        } else if (ext === '.json') {
          curr.json = file
        }
        curr.baseName = baseName
      }
    })
  }))
  return group
}

export async function loadConstractModals (path) {
  let groups = await loadConstractDir(path)
  let contract = new Contract()
  for (let modalGroup in groups) {
    let group = groups[modalGroup]
    for (let modalName in group) {
      let modal = group[modalName]
      let content
      if (modal.js) { // 装饰器转成JSON
        content = await decoratorFileAsync(modal.js)
      } else if (modal.json) { // 直接读取json文件
        content = JSON.parse(await readFileAsync(modal.json))
      }
      console.log(content)
      group[modalName] = contract.createModal(Object.assign({}, content, modal))
    }
  }
  return groups
}
