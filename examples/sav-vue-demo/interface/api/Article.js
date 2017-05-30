import {Modal, post} from 'sav'

@Modal({
  prefix: 'api'
})
export default class Article {
  @post({
    path: 'comment/:aid',
    response: {
      props: {
        aid: String,
        content: String,
        createdAt: String
      }
    },
    request: {
      props: {
        aid: String,
        content: String
      }
    }
  })
  comment() {}
}
