import { isObject } from "packages/shared/src";
import { activeEffect } from "./effect";
import { reactive } from "./reactive";

export const enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
}
// 响应式对象实现逻辑
export const mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    console.log("取值的时候关联 effect 并进行深度代理");
    track(target, key);
    let result = Reflect.get(target, key, receiver);
    if (isObject(result)) {
      // 如果取到的是一个对象，则需要继续将这个对象作为代理对象
      return reactive(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    // ! Reflect.set 必须放到 trigger 前面
    const flag = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      console.log("设置新的值时，触发更新");
      trigger(target, key, value, oldValue);
    }

    return flag;
  },
};

// {name: "dell", age: 18} -> name => [e1, e2]

// Map = { ({name: "dell", age: 18}) : name }
// Map = { name: set(e1, e2) }

const targetMap = new WeakMap();
function track(target, key) {
  if (activeEffect) {
    // 当前属性是在 effect 中使用的，才收集。
    let depsMap = targetMap.get(target); // => { ({name: "dell", age: 18}) : { name: Set(e1, e2), age: Set(e1) } }
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    // effects 是 Set()
    let effects = depsMap.get(key);
    if (!effects) {
      depsMap.set(key, (effects = new Set()));
    }

    trackEffects(effects);
  }
}

export function trackEffects(effects) {
  let shouldTrack = !effects.has(activeEffect);
  if (shouldTrack) {
    // 1. 属性关联 effect
    effects.add(activeEffect);
    // 2. effect 关联属性
    activeEffect.deps.push(effects);
  }
}

function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  triggerEffects(effects);
}

export function triggerEffects(effects) {
  if (effects.size > 0) {
    [...effects].forEach((effect) => {
      // 当前正在执行的和要执行的 effect 是同一个 effect，就屏蔽掉
      // if (effect !== activeEffect && effect !== activeEffect.parent) {
      if (effect !== activeEffect && !isParentEffect(effect)) {
        // 应该执行 scheduler
        if (effect.scheduler) {
          effect.scheduler();
        } else {
          effect.run();
        }
      }
    });
  }
}

// 递归判断是否为孩子
// e1 => age -> Set(e1)
// e2 中修改了 age 的值， e2.parent 是 e1， 也就是当前的 activeEffect.parent
function isParentEffect(effect) {
  let currentEffect = activeEffect?.parent;
  while (currentEffect) {
    if (currentEffect === effect) {
      return true;
    }
    currentEffect = currentEffect.parent;
  }

  return false;
}
