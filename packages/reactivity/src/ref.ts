import { toReactive } from "./reactive";

class RefImpl {
  _value;
  // 内部采用类的属性访问器 -> Object.defineProperty
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = toReactive(newValue);
    }
  }
}
export function ref(value) {
  return new RefImpl(value);
}
