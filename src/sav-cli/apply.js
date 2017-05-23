// import {applyVue} from './applyVue.js'
import {applyContract} from './applyContract.js'
// import {applySchemaApi} from './applySchemaApi.js'
import {applyAction} from './applyAction.js'

export async function apply (groups, program) {
  // await prepareModules(groups)
  let tasks = [applyContract(groups, program)]
  // if (program.view) {
  //   tasks.push(applyVue(groups, program))
  //   tasks.push(applySchemaApi(groups, program))
  // }
  if (program.actions) {
    tasks.push(applyAction(groups, program))
  }
  return Promise.all(tasks)
}
