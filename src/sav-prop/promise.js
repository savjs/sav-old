import {prop as initProp} from './prop'

export function promise (ctx, Promiser) {
  if (!ctx.prop) {
    initProp(ctx)
  }
  let {prop} = ctx
  Promiser || (Promiser = Promise)
  prop({
    resolve: Promiser.resolve.bind(Promiser),
    reject: Promiser.reject.bind(Promiser),
    all: Promiser.all.bind(Promiser),
    then: (fn, fail) => {
      return new Promiser(fn, fail)
    }
  })
}
