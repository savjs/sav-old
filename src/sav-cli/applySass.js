import {createVueRoutes} from './applyVue.js'
import {resolve} from 'path'
import {writeFileAsync, mkdirAsync} from './sav/util/file.js'
// import {hyphenCase} from 'sav-util'

export async function applySass (groups, program) {
  let {files} = createVueRoutes(groups)
  let modals = {}
  files.forEach((file) => {
    // './Home/HomeAbout.vue' => ['Home', 'HomeAbout']
    file = file.substr(2).slice(0, -4).split('/')
    let dir = file.shift()
    let arr = modals[dir] || (modals[dir] = [])
    arr.push(file.shift())
  })
  await mkdirAsync(program.sass)
  // console.log(modals)
  // let dirs = [program.sass]
  // let indexs = []
  // let sassFiles = []
  // let {sassPage} = program

  // if (sassPage === 'modal') {
  //   indexs.push({name: 'index', value: Object.keys(modal)})
  // } else if (sassPage === 'action') {
  //   // .HomeAbout
  // } else {

  // }
}
