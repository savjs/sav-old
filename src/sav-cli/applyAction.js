import acorn from 'acorn'
import {resolve} from 'path'
import {writeFileAsync, mkdirAsync, fileExistsAsync, readFileAsync} from './sav/util/file.js'
import {createIndex, createRoot} from './applyUtil.js'

let actionGroups = {
  api: true,
  page: true
}
const applyTitle = '[  Action]'

export async function applyAction (groups, program) {
  let dir = program.actions
  console.log(`${applyTitle}[ensure] `, dir)
  await mkdirAsync(dir)
  let tasks = []
  let indexs = {}
  for (let moduleGroup in groups) {
    if (actionGroups[moduleGroup]) {
      indexs[moduleGroup] = true
      let group = groups[moduleGroup]
      for (let moduleName in group) {
        let module = group[moduleName]
        tasks.push(createAction(moduleGroup, module, moduleName, dir))
      }
      tasks.push(createIndex(moduleGroup, group, dir))
    }
  }
  tasks.push(createRoot(indexs, dir))
  return Promise.all(tasks)
}

function createAction (groupDir, module, moduleName, dest) {
  return Promise.resolve().then(async () => {
    let dir = resolve(dest, groupDir)
    await mkdirAsync(dir)
    let jsFile = resolve(dir, moduleName + '.js')
    let exists = await fileExistsAsync(jsFile)
    let methods = Object.keys(module.routes)
    if (exists) {
      let jsData = (await readFileAsync(jsFile)).toString()
      let parsed = parseClassModule(jsData, moduleName)
      if (parsed) {
        methods = methods.filter((method) => parsed.methods.indexOf(method) === -1)
        if (methods.length) {
          let attach = createMethods(methods)
          jsData = jsData.substr(0, parsed.end - 1) + attach + jsData.substr(parsed.end - 1)
          console.log(`${applyTitle}[update] `, jsFile)
          await writeFileAsync(jsFile, jsData)
        } else {
          console.log(`${applyTitle}[  skip] `, jsFile)
        }
      } else {
        console.log(`${applyTitle}[error] `, jsFile)
      }
    } else {
      let jsData = createClassModule(moduleName, methods)
      console.log(`${applyTitle}[create] `, jsFile)
      await writeFileAsync(jsFile, jsData)
    }
  })
}

function createClassModule (className, methods, args = '', body = '') {
  if (body) {
    body = '    ' + body
  }
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
  if (body) {
    body = '    ' + body
  }
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
