import {ApiInterface, post, requestSchema, responseSchema} from 'sav/decorator'

@ApiInterface()
export default class Article {
  
  @requestSchema()
  @post('comment/:aid')
  @responseSchema()
  comment() {}
}
