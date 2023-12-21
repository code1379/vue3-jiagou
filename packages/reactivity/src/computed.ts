import { isFunction } from "@coco/shared";
import { ReactiveEffect, activeEffect } from "./effect";
import { trackEffects, triggerEffects } from "./baseHandler";

class ComputedRefImpl {
  effect;
  _value;
  dep = new Set();
  constructor(public getter, public setter) {
    // 计算属性就是一个 effect，会让 getter中的属性收集这个effect（getter 就相当于）
    this.effect = new ReactiveEffect(getter, () => {
      triggerEffects(this.dep);
    });
  }

  get value() {
    // 之前     收集 对象 - 属性 - [effect]
    // 现在这里 收集 属性 - [effect]
    if (activeEffect) {
      trackEffects(this.dep);
    }
    // 获取时，让 getter 执行，拿到返回值作为计算属性的值
    this._value = this.effect.run();

    return this._value;
  }

  set value(val) {
    // 修改时触发 setter 即可
    this.setter(val);
  }
}
export function computed(getterOrOptions) {
  const isGetter = isFunction(getterOrOptions);

  let getter;
  let setter;

  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("Write operation failed: computed value is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}
