
@Api()                  // 定义一个API模块
export default class Article {

  @output()             // 保证输出的数据是合法的
  @post('artilce/:aid') // 需要提供接口路由地址
  @input()              // 保证输入的数据是合法的
  @auth()               // 认证通过才能访问
  update() {}
}
