import Helper from './Helper.js'
import Article from './Article.js'
import {prop} from '@sav/util'

function dispatch (name, func, target) {
  
}

prop(Helper, '$dispatch', dispatch)

console.log(Helper, Article)

// function createProxyBind () {
//   let first
//   return (target) => {
//     let proxy = new Proxy(target, {
//       get (target, name) {
//         if (name in target) {
//         }
//       }
//     })
//     return proxy
//   }
// }






