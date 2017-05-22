// export * from './sav'
import {Graph} from './sav'

let graph = new Graph()

graph.page.modal('Test').route('test', {
  response: {
    state: 'userInfo',
    props: {
      username: 'String'
    }
  }
})

graph.schema.declare({
  name: 'Sex',
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ]
})

console.log(graph.uris)
console.log(JSON.stringify(graph, null, 2))
