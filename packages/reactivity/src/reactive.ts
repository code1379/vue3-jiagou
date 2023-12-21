import { isObject } from "@coco/shared";
import { ReactiveFlags, mutableHandler } from "./baseHandler";

export function reactive(target) {
  return createReactiveObject(target);
}

const reactiveMap = new WeakMap(); // 防止内存泄漏
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

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE]);
}
