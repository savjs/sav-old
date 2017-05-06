const {ApiInterface, post, requestSchema, responseSchema} = SavDecorators

@ApiInterface({
  routePrefix: 'api'
})
export default class Article {
  
  @responseSchema()
  @post('comment/:aid')
  @requestSchema()
  comment() {}
}
