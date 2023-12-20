const person = {
  name: "张三",
  get aliasName() {
    // 属性访问器
    console.log("this", this);
    return "帅气的" + this.name;
  },
};

// console.log("person.aliasName", person.aliasName);
const proxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log("get", key);
    // return target[key];
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // target[key] = value;
    return Reflect.set(target, key, value, receiver);
  },
});

console.log("proxy.aliasName", proxy.aliasName);

/* 说明
** get 返回 target[key] 的时候 ** 不使用 Reflect 的话，里面的 this 不同。
- 会触发 aliasName 的收集，不会触发 name 的收集
- 所以当 name 修改后，aliasName 不会发生改变。

*/
