/**
 * 更新 actions 实现的内容
 */

import * as acorn from 'acorn'
import es7Plugin from 'acorn-es7-plugin'
import path from 'path'
import {noticeString, ensureDir, outputFile, inputFile, readDir, pathExists} from '../util.js'

es7Plugin(acorn)
const acornParse = acorn.parse

export function writeActions (dir, modals) {
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .map((actionName) => writeAction(dir, actionName, modals[actionName])))
    .then(() => updateIndex(dir)))
}

let excludeFiles = ['index.js']

function updateIndex (dir) {
  return readDir(dir).then((dirs) => {
    let keys = dirs.filter((it) => excludeFiles.indexOf(it) === -1 && path.extname(it) === '.js')
      .map((name) => path.basename(name, '.js'))
    let reqs = keys.map((name) => `  ${name}: require('./${name}')`).join(',\n')
    let data = `${noticeString}module.exports = {\n${reqs}\n}\n`
    return outputFile(path.resolve(dir, `index.js`), data)
  })
}

function writeAction (dir, actionName, action) {
  let file = path.resolve(dir, actionName + '.js')
  return pathExists(file).then(async (exists) => {
    let methods = Object.keys(action.routes).filter(key => {
      return action.routes[key].api === true
    })
    if (exists) {
      let data = (await inputFile(file)).toString()
      let parsed = parseClassModule(data, actionName)
      if (parsed) {
        methods = methods.filter((method) => parsed.methods.indexOf(method) === -1)
        if (methods.length) {
          let attach = createMethods(methods)
          data = data.substr(0, parsed.end - 1) + attach + data.substr(parsed.end - 1)
          await outputFile(file, data)
        }
      }
    } else {
      let data = createClassModule(actionName, methods)
      data = `${noticeString}${data}`
      await outputFile(file, data)
    }
  })
}

function createClassModule (className, methods, args = '', body = '') {
  if (body) {
    body = '    ' + body
  }
  methods = methods.map((method) => {
    return `
  async ${method} (${args}) {
${body}
  }`
  }).join('').trim()
  return `module.exports = class ${className} {
  ${methods}
}
`
}

function createMethods (methods, args = '', body = '') {
  if (body) {
    body = '    ' + body
  }
  return methods.map((method) => `  async ${method} (${args}) {
${body}
  }`).join('\n') + '\n'
}

function parseClassModule (str, className) {
  let ast = acornParse(str, {
    sourceType: 'module',
    ranges: true,
    plugins: {asyncawait: true},
    ecmaVersion: 8
  })
  for (let item of ast.body) {
    // 表达式
    if (item.type === 'ExpressionStatement') { // module.export = class ClassName {}
      // 赋值表达式, 右边是类
      if (item.expression.right && item.expression.right.type === 'ClassExpression') {
        let ret = compareClass(item.expression.right, className)
        if (ret) {
          return ret
        }
      }
    } else if (item.type === 'ClassDeclaration') { // class ClassName
      let ret = compareClass(item, className)
      if (ret) {
        return ret
      }
    } else if (item.type === 'ExportDefaultDeclaration') { // export default class ClassName {}
      let ret = compareClass(item.declaration, className)
      if (ret) {
        return ret
      }
    }
  }
}

function compareClass (cls, className) {
  // 是要处理的类
  if (cls.id.name === className) {
    if (cls.body.type === 'ClassBody') {
      let ret = {
        end: cls.end
      }
      let methods = ret.methods = []
      for (let method of cls.body.body) {
        // 类方法
        if (method.type === 'MethodDefinition' && !method.static) {
          methods.push(method.key.name)
        }
      }
      return ret
    }
  }
}
