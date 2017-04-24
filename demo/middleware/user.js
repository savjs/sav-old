
@group()
class User {
  async info ({setState, cache, session}) {
    setState({
      userInfo: await cache.getBy('user', session.uid)
    })
  }
}
