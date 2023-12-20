export let activeEffect = undefined;
class ReactiveEffect {
  constructor(public fn) {}
  run() {
    // 当运行的时候，我们需要将属性和对应的 effect 关联起来
    // 利用 js 单线程的特性，先放在全局，再取值
    try {
      activeEffect = this;
      return this.fn(); // 会触发属性的 get
    } finally {
      // effect(() => {}); state.xxx = "a"; effect 执行完毕之后，后面的代码不需要进行依赖收集
      activeEffect = undefined;
    }
  }
}
export function effect(fn) {
  // 将用户传递的函数，变成响应式的函数
  const _effect = new ReactiveEffect(fn);
  // 默认让用户的函数执行一次
  _effect.run();
}
