const {LayoutInterface, invoke, res} = SavDecorators

@LayoutInterface()
export default class Guest {
  @res({
    name: 'ResCopyRight',
    props: {
      copyright: 'CopyRight'
    },
    refs: {
      CopyRight: {
        props: {
          company: 'String'
        }
      }
    }
  })
  @invoke()
  copyRight () {}
}
