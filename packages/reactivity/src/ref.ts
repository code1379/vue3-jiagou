import { trackEffects, triggerEffects } from "./baseHandler";
import { activeEffect } from "./effect";
import { toReactive } from "./reactive";

class RefImpl {
  _value;
  deps = new Set();
  // 内部采用类的属性访问器 -> Object.defineProperty
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    if (activeEffect) {
      trackEffects(this.deps);
    }
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = toReactive(newValue);
      triggerEffects(this.deps);
    }
  }
}
export function ref(value) {
  return new RefImpl(value);
}

class ObjectRefImpl {
  constructor(public object, public key) {}

  get value() {
    return this.object[this.key];
  }

  set value(val) {
    this.object[this.key] = val;
  }
}
export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  let res = {};
  for (let key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}
