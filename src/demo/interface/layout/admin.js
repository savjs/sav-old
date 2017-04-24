
@layout()
class Admin {

  @state()
  userInfo () {}
  
  async invoke ({setState, cache, session}) {
    setState({
      userInfo: await cache.getBy('user', session.uid)
    })
  }
}
