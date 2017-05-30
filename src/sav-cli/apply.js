import {applyVue} from './applyVue.js'
import {applyContract} from './applyContract.js'
import {applyUri} from './applyUri.js'
import {applyAction} from './applyAction.js'

export async function apply (groups, program) {
  applyUri(groups)
  let tasks = [applyContract(groups, program)]
  if (program.views) {
    tasks.push(applyVue(groups, program))
  }
  if (program.actions) {
    tasks.push(applyAction(groups, program))
  }
  return Promise.all(tasks)
}
