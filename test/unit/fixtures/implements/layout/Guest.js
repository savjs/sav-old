import GuestLayoutInterface from '../../interface/Layout/Guest.js'
import {Layout} from 'sav/decorator'

@Layout(GuestLayoutInterface)
export default class Guest {
  invoke () {}

  copyRight () {}
}
