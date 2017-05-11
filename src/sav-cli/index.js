import program from 'commander'
import {resolve} from 'path'

import {exportSavDecorators} from './decorator.js'
import {loadConstractModals} from './loader.js'
import {apply} from './apply.js'

program
  .version('$$VERSION$$')
  .option('-p, --path [path]', 'convart root path')
  .option('-d, --dest [dest]', 'dest dir')
  .option('-v, --view [view]', 'view dir')
  .option('-a, --action [action]', 'action dir')
  .option('-u, --use [plugins]', 'plugins to use')
  .parse(process.argv)

program.path = 'path' in program ? resolve(program.path || '.', '') : false

if (!program.path) {
  program.help()
  process.exit(0)
}

program.dest = 'dest' in program ? resolve(program.dest) : false
program.view = 'view' in program ? resolve(program.view) : false
program.action = 'action' in program ? resolve(program.action) : false

// @TODO 加载插件后再导出全局的 decorators
program.plugins = 'plugins' in program ? (program.plugins.split(',').map((it) => it.trim())) : false

exportSavDecorators()

loadConstractModals(program.path).then(async (groups) => {
  return await apply(groups, program)
}).then(() => console.log('done')).catch((err) => {
  console.error(err)
  process.exit(1)
})
