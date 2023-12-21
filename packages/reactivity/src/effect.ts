export let activeEffect = undefined;

// effect 重新执行之前，清除之前的依赖收集
// deps = [Set(e1), Set(e1, e2)]
// 找到 deps 中的 set，清理掉里面的 effect
function cleanupEffect(effect) {
  const deps = effect.deps;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      const effects = deps[i];
      effects.delete(effect); // 删除掉 set 中的 effect
    }
  }
  effect.deps.length = 0;
}

class ReactiveEffect {
  parent: ReactiveEffect | undefined = undefined;
  deps = []; // effect 中要记录那些属性是在effect中调用的
  constructor(public fn, public scheduler) {}
  run() {
    // 当运行的时候，我们需要将属性和对应的 effect 关联起来
    // 利用 js 单线程的特性，先放在全局，再取值
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn(); // 会触发属性的 get
    } finally {
      // effect(() => {}); state.xxx = "a"; effect 执行完毕之后，后面的代码不需要进行依赖收集
      activeEffect = this.parent;
    }
  }
}

// 属性和 effect 之间是什么样的关系？
// 1:1
// 1:n
// n:n

// 1. 1 个 effect 包含多个属性
// 2. 1 个 属性 可以在多个 effect 中被获取
// 得到结论： n:n
// * 所以我们需要 effect 记录属性，也 需要属性记录 effect

export function effect(fn, options: any = {}) {
  // 将用户传递的函数，变成响应式的函数
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // 默认让用户的函数执行一次
  _effect.run();

  const runner = _effect.run.bind(_effect);
  return runner;
}
