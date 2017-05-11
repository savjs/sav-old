import acorn from 'acorn'
import {resolve} from 'path'
import {writeFileAsync, mkdirAsync, fileExistsAsync, readFileAsync} from './sav/util/file.js'
import {createIndex, createRoot} from './applyContract.js'

export async function applyAction (groups, program) {
  await mkdirAsync(program.action)
  let tasks = []
  for (let moduleGroup in groups) {
    let group = groups[moduleGroup]
    for (let moduleName in group) {
      let module = group[moduleName]
      tasks.push(createAction(moduleGroup, module, program.action))
    }
    tasks.push(createIndex(moduleGroup, group, program.action, true))
  }
  tasks.push(createRoot(groups, program.action, true))
  return Promise.all(tasks)
}

function createAction (groupDir, module, dest) {
  return Promise.resolve().then(async () => {
    let dir = resolve(dest, groupDir)
    await mkdirAsync(dir)
    let jsFile = resolve(dir, module.moduleName + '.js')
    let exists = await fileExistsAsync(jsFile)
    let methods = module.routes.map((it) => it.actionName)
    if (groupDir.toLowerCase() === 'layout') {
      methods.push('invoke')
    }
    if (exists) {
      let jsData = (await readFileAsync(jsFile)).toString()
      let parsed = parseClassModule(jsData, module.moduleName)
      if (parsed) {
        methods = methods.filter((method) => parsed.methods.indexOf(method) === -1)
        if (methods.length) {
          let attach = createMethods(methods)
          jsData = jsData.substr(0, parsed.end - 1) + attach + jsData.substr(parsed.end - 1)
          await writeFileAsync(jsFile, jsData)
          console.log('updateAction: ', jsFile)
        } else {
          console.log('skipAction: ', jsFile)
        }
      } else {
        console.log('Can not sync methods to: ', jsFile)
      }
    } else {
      let jsData = createClassModule(module.moduleName, methods)
      console.log('createAction: ', jsFile)
      await writeFileAsync(jsFile, jsData)
    }
  })
}

function createClassModule (className, methods, args = '', body = '') {
  methods = methods.map((method) => {
    return `
  ${method} (${args}) {
    ${body}
  }`
  }).join('').trim()
  return `module.exports = class ${className} {
  ${methods}
}
`
}

function createMethods (methods, args = '', body = '') {
  return methods.map((method) => `  ${method} (${args}) {
    ${body}
  }`).join('\n') + '\n'
}

function parseClassModule (str, className) {
  let ast = acorn.parse(str, {
    sourceType: 'module',
    ranges: true
  })
  for (let item of ast.body) {
    // 表达式
    if (item.type === 'ExpressionStatement') {
      // 赋值表达式, 右边是类
      if (item.expression.right && item.expression.right.type === 'ClassExpression') {
        let ret = compareClass(item.expression.right, className)
        if (ret) {
          return ret
        }
      }
    } else if (item.type === 'ClassDeclaration') {
      let ret = compareClass(item, className)
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
