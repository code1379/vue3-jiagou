import { isFunction, isObject } from "@coco/shared";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

function traverse(source, seen = new Set()) {
  if (!isObject(source)) return source;
  if (seen.has(source)) return source;

  seen.add(source);

  // 这里访问了对象的所有属性
  for (let k in source) {
    traverse(source[k], seen);
  }

  return source;
}

export function watch(source, cb, options: any = {}) {
  let getter;
  if (isReactive(source)) {
    // 遍历这个对象上的所有属性进行监听（会递归 - 性能不高）
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }

  let oldValue = undefined;

  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  // 创建响应式，并没有收集对应的依赖
  const effect = new ReactiveEffect(getter, job);

  // 是否立即执行回调函数
  if (options.immediate) {
    job();
  }

  // 不管怎么样，都要 执行 effect.run 进行依赖收集
  oldValue = effect.run();
}
