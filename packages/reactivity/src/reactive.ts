import { isObject } from "@coco/shared";

const enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
}
export function reactive(target) {
  return createReactiveObject(target);
}

const reactiveMap = new WeakMap(); // 防止内存泄漏

// 响应式对象实现逻辑
const mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    console.log("属性在 effect 中被使用了");
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("需要让 effect 重新执行");
    return Reflect.set(target, key, value, receiver);
  },
};
function createReactiveObject(target) {
  // 不是对象直接返回
  if (!isObject(target)) return;

  // 增添自定义属性
  if (target[ReactiveFlags.IS_REACTIVE]) return target;

  // 缓存结果
  // 防止同一个对象被代理多次，返回的永远是同一个代理对象
  let existingProxy = reactiveMap.get(target);
  if (existingProxy) return existingProxy;

  const proxy = new Proxy(target, mutableHandler);
  reactiveMap.set(target, proxy);
  return proxy;
}
