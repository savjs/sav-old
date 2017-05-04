import {LayoutInterface, invoke, res} from 'sav/decorator'

@LayoutInterface()
export default class Guest {
  @res({
    name: 'ResCopyRight',
    props: {
      copyright: 'CopyRight'
    },
    refs: {
      CopyRight: {
        props: {
          company: 'String'
        }
      }
    }
  })
  @invoke()
  copyRight () {}
}
