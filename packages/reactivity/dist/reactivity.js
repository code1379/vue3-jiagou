// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
var ReactiveEffect = class {
  // effect 中要记录那些属性是在effect中调用的
  constructor(fn) {
    this.fn = fn;
    this.parent = void 0;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
};
function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}

// packages/reactivity/src/baseHandler.ts
var mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    console.log("\u53D6\u503C\u7684\u65F6\u5019\u5173\u8054 effect ");
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const flag = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      console.log("\u8BBE\u7F6E\u65B0\u7684\u503C\u65F6\uFF0C\u89E6\u53D1\u66F4\u65B0");
      trigger(target, key, value, oldValue);
    }
    return flag;
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let effects = depsMap.get(key);
    if (!effects) {
      depsMap.set(key, effects = /* @__PURE__ */ new Set());
    }
    let shouldTrack = !effects.has(activeEffect);
    if (shouldTrack) {
      effects.add(activeEffect);
      activeEffect.deps.push(effects);
    }
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap)
    return;
  const effects = depsMap.get(key);
  if (effects.size > 0) {
    effects.forEach((effect2) => {
      if (effect2 !== activeEffect && !isParentEffect(effect2)) {
        effect2.run();
      }
    });
  }
}
function isParentEffect(effect2) {
  let currentEffect = activeEffect.parent;
  while (currentEffect) {
    if (currentEffect === effect2) {
      return true;
    }
    currentEffect = currentEffect.parent;
  }
  return false;
}

// packages/reactivity/src/reactive.ts
function reactive(target) {
  return createReactiveObject(target);
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target))
    return;
  if (target["__v_isReactive" /* IS_REACTIVE */])
    return target;
  let existingProxy = reactiveMap.get(target);
  if (existingProxy)
    return existingProxy;
  const proxy = new Proxy(target, mutableHandler);
  reactiveMap.set(target, proxy);
  return proxy;
}
export {
  activeEffect,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
