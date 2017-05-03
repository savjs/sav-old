import {ApiInterface, post, requestSchema, responseSchema} from 'sav/decorator'

@ApiInterface({
  routePrefix: 'api'
})
export default class Article {
  
  @responseSchema()
  @post('comment/:aid')
  @requestSchema()
  comment() {}
}
