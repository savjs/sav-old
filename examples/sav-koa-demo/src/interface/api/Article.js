const {ApiInterface, post, req, res} = SavDecorators

@ApiInterface({
  routePrefix: 'api'
})
export default class Article {
  @res({
    props: {
      aid: 'String',
      content: 'String',
      createdAt: 'String'
    }
  })
  @post('comment/:aid')
  @req({
    props: {
      aid: 'String',
      content: 'String'
    }
  })
  comment() {}
}
