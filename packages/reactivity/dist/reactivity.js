// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactive.ts
function reactive(target) {
  return createReactiveObject(target);
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
var mutableHandler = {
  // 原始对象，属性，代理对象
  get(target, key, receiver) {
    console.log("\u5C5E\u6027\u5728 effect \u4E2D\u88AB\u4F7F\u7528\u4E86");
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("\u9700\u8981\u8BA9 effect \u91CD\u65B0\u6267\u884C");
    return Reflect.set(target, key, value, receiver);
  }
};
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

// packages/reactivity/src/effect.ts
function effect() {
}
export {
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
