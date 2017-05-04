import GuestLayoutInterface from '../../interface/Layout/Guest.js'
import {Layout} from 'sav/decorator'

@Layout(GuestLayoutInterface)
export default class Guest {
  invoke ({all}) {
    return all([
      this.copyRight()
    ])
  }

  copyRight ({setState}) {
    setState({
      copyright: {
        company: 'sav.inc'
      }
    })
  }
}
