import path from 'path'
import {ensureDir, outputFile} from '../util.js'

export async function writeExample (dir) {
  let modals = path.resolve(dir, 'modals')
  await ensureDir(modals)
  await outputFile(path.resolve(modals, 'Home.js'), homeContent)
}

let homeContent = `import {Modal, get} from 'sav'

@Modal({
  path: ''
})
export default class Home {
  @get({
    path: '',
    view: true
  })
  index() {}

  @get()
  session() {}

  @get({
    view: true
  })
  about() {}
}

`
