import {Modal, get} from 'sav'

@Modal({
  layout: 'User',
  path: ''
})
export default class Home {
  @get({
    path: '',
    title: '主页',
    keywords: '关键字列表',
    description: '页面描述'
  })
  index () {}

  @get({
    keywords: '关键字列表',
    description: '页面描述',
    title: '关于我们'
  })
  about () {}
}
