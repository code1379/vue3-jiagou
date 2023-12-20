import { isObject } from "@coco/shared";
export function reactive(target) {
  return createReactiveObject(target);
}

// 响应式对象实现逻辑

const mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    console.log("属性在 effect 中被使用了");
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

  const proxy = new Proxy(target, mutableHandler);

  return proxy;
}
