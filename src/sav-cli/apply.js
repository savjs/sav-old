import {makeSavRoute, makeVueRoute} from '../sav/middlewares'
import {applyVue} from './applyVue.js'
import {applyContract} from './applyContract.js'
import {applySchemaApi} from './applySchemaApi.js'

export async function prepareModules (groups) {
  for (let modalGroup in groups) {
    let group = groups[modalGroup]
    for (let modalName in group) {
      let module = group[modalName]
      makeSavRoute(module)
      makeVueRoute(module)
    }
  }
}

export async function apply (groups, program) {
  await prepareModules(groups)
  let tasks = [applyContract(groups, program)]
  if (program.view) {
    tasks.push(applyVue(groups, program))
    tasks.push(applySchemaApi(groups, program))
  }
  return Promise.all(tasks)
}
