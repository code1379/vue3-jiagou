// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanupEffect(effect2) {
  const deps = effect2.deps;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      const effects = deps[i];
      effects.delete(effect2);
    }
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  // effect 中要记录那些属性是在effect中调用的
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
};
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  return runner;
}

// packages/reactivity/src/baseHandler.ts
var mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    console.log("\u53D6\u503C\u7684\u65F6\u5019\u5173\u8054 effect \u5E76\u8FDB\u884C\u6DF1\u5EA6\u4EE3\u7406");
    track(target, key);
    let result = Reflect.get(target, key, receiver);
    if (isObject(result)) {
      return reactive(result);
    }
    return result;
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
    trackEffects(effects);
  }
}
function trackEffects(effects) {
  let shouldTrack = !effects.has(activeEffect);
  if (shouldTrack) {
    effects.add(activeEffect);
    activeEffect.deps.push(effects);
  }
}
function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap)
    return;
  const effects = depsMap.get(key);
  triggerEffects(effects);
}
function triggerEffects(effects) {
  if (effects.size > 0) {
    [...effects].forEach((effect2) => {
      if (effect2 !== activeEffect && !isParentEffect(effect2)) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }
}
function isParentEffect(effect2) {
  let currentEffect = activeEffect?.parent;
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
function isReactive(target) {
  return !!(target && target["__v_isReactive" /* IS_REACTIVE */]);
}
function toReactive(target) {
  return isObject(target) ? reactive(target) : target;
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this._dirty = true;
    this.dep = /* @__PURE__ */ new Set();
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerEffects(this.dep);
      }
    });
  }
  get value() {
    if (activeEffect) {
      trackEffects(this.dep);
    }
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(val) {
    this.setter(val);
  }
};
function computed(getterOrOptions) {
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

// packages/reactivity/src/watch.ts
function traverse(source, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source))
    return source;
  if (seen.has(source))
    return source;
  seen.add(source);
  for (let k in source) {
    traverse(source[k], seen);
  }
  return source;
}
function doWatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue = void 0;
  let clean = null;
  const onCleanup = (fn) => {
    clean = fn;
  };
  const job = () => {
    if (cb) {
      if (clean)
        clean();
      const newValue = effect2.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (options.immediate) {
    job();
  }
  oldValue = effect2.run();
}
function watch(source, cb, options = {}) {
  doWatch(source, cb, options);
}
function watchEffect(fn, options = {}) {
  doWatch(fn, null, options);
}

// packages/reactivity/src/ref.ts
var RefImpl = class {
  // 内部采用类的属性访问器 -> Object.defineProperty
  constructor(rawValue) {
    this.rawValue = rawValue;
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
};
function ref(value) {
  return new RefImpl(value);
}
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  isReactive,
  reactive,
  ref,
  toReactive,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.js.map
