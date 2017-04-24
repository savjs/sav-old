import {LayoutInterface, invoke} from '@sav/decorator'

@LayoutInterface()
export default class Guest {
  
  @invoke()
  copyRight () {}
}
