/**
 * 更新 actions 实现的内容
 */
import PhpParser from 'php-parser'
import path from 'path'
import {noticeString, ensureDir, outputFile, inputFile, pathExists} from '../util.js'

let parser = new PhpParser({
  ast: {
    withPositions: true
  }
})

export function writePhpActions (dir, modals) {
  return ensureDir(dir).then(() => Promise.all(Object.keys(modals)
    .map((actionName) => writePhpAction(dir, actionName, modals[actionName]))))
}

function writePhpAction (dir, actionName, action) {
  let file = path.resolve(dir, actionName + '.php')
  return pathExists(file).then(async (exists) => {
    let methods = Object.keys(action.routes)
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
      data = `<?php\n${noticeString}${data}`
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
  public function ${method} (${args}) {
${body}
  }`
  }).join('').trim()
  return `class ${className}
{
  ${methods}
}
`
}

function createMethods (methods, args = '', body = '') {
  if (body) {
    body = '    ' + body
  }
  return methods.map((method) => `  public function ${method} (${args}) {
${body}
  }`).join('\n') + '\n'
}

function parseClassModule (str, className) {
  let ast = parser.parseCode(str, `${className}.php`)
  let target
  for (let item of ast.children) {
    if (item.kind === 'namespace') {
      for (let cls of item.children) {
        if (cls.kind === 'class' && cls.name === className) {
          target = cls
          break
        }
      }
    } else if (item.kind === 'class' && item.name === className) {
      target = item
    }
    if (!target) {
      continue
    }
    let methods = target.body
    .filter((it) => it.kind === 'method' && it.visibility === 'public' && it.isStatic === false)
    .map((it) => it.name)
    let start = target.loc.start.offset
    let end = target.loc.end.offset - 1
    return {
      methods,
      start,
      end
    }
  }
}
