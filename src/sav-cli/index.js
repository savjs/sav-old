import program from 'commander'
import {resolve} from 'path'

import {exportSavDecorators} from './decorator.js'
import {loadConstractModals} from './loader.js'
import {apply} from './apply.js'

program
  .version('$$VERSION$$')
  .option('-p, --path [path]', 'convart root path')
  .option('-d, --dest [dest]', 'dest dir')
  .option('-v, --views [views]', 'views dir')
  .option('-a, --actions [actions]', 'actions dir')
  .parse(process.argv)

program.path = 'path' in program ? resolve(program.path || '.', '') : false

if (!program.path) {
  program.help()
  process.exit(0)
}

program.dest = 'dest' in program ? resolve(program.dest) : false
program.views = 'views' in program ? resolve(program.views) : false
program.actions = 'actions' in program ? resolve(program.actions) : false

exportSavDecorators()

loadConstractModals(program.path).then(async (groups) => {
  return await apply(groups, program)
}).then(() => console.log('done')).catch((err) => {
  console.error(err)
  process.exit(1)
})
