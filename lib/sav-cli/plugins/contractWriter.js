/**
 * 生成 contract 目录的内容
 */

import path from 'path'
import JSON5 from 'json5'
import {noticeString, ensureDir, outputFile} from '../util.js'
// import jsonar from 'jsonar'

export function writeContract (dir, data, opts = {}) {
  return savContract(dir, data, opts)
}

async function savContract (dir, data, opts) {
  await ensureDir(dir)
  await writeIndex(data, dir)

  for (let name in data) {
    let mods = data[name]
    let modsDir = path.resolve(dir, name)

    await ensureDir(modsDir)
    await writeIndex(mods, modsDir, name)

    for (let modName in mods) {
      let mod = mods[modName]
      let modData = JSON5.stringify(mod, null, 2)
      modData = `${noticeString}module.exports = ${modData}\n`
      await outputFile(path.resolve(modsDir, `${modName}.js`), modData)
      // if (opts.lang) {
      //   if (opts.lang.indexOf('php') !== -1) {
      //     let phpData = jsonar.arrify(mod, { prettify: true, indent: 2, space: true })
      //     phpData = `${noticeString}return ${phpData}\n`
      //     await outputFile(path.resolve(modsDir, `${modName}.php`), phpData)
      //   }
      // }
    }
  }
}

const indexAssigns = ['schemas', 'mocks']
const indexObjects = ['modals']
// const indexArrs = []

function writeIndex (groups, dir, name) {
  let data
  let keys = Object.keys(groups)
  if (name) {
    if (indexAssigns.indexOf(name) !== -1) {
      let reqs = keys.map((name) => `  require('./${name}')`).join(',\n')
      data = `${noticeString}module.exports = Object.assign({},\n${reqs}\n)\n`
    } else if (indexObjects.indexOf(name) !== -1) {
      let reqs = keys.map((name) => `  ${name}: require('./${name}')`).join(',\n')
      data = `${noticeString}module.exports = {\n${reqs}\n}\n`
    }// else if (indexArrs.indexOf(name) !== -1) {
      // let reqs = keys.map((name) => `  require('./${name}')`).join(',\n')
      // data = `${noticeString}module.exports = [\n${reqs}\n]\n`
    // }
  } else {
    let reqs = keys.map((name, index) => {
      let ret = `  ${name}: require('./${name}')`
      if (name === 'mocks') {
        let dot = (index === keys.length - 1) ? '' : ','
        return `// #if IS_MOCK\n${ret}${dot}\n// #endif`
      }
      return ret
    }).join(',\n').replace(/endif,/g, 'endif')
    data = `${noticeString}module.exports = {\n${reqs}\n}\n`
  }
  return outputFile(path.resolve(dir, `index.js`), data)
}
