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
    console.log("取值的时候关联 effect ");
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log("设置新的值时，触发更新");
    return Reflect.set(target, key, value, receiver);
  },
};
