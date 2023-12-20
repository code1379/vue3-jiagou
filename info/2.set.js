let s = new Set(1);

// ! 它认为我们的长度变了
// s.forEach((item) => {
//   s.delete(item);
//   s.add(item);
//   console.log("kill");
// });

[...s].forEach((item) => {
  s.delete(item);
  s.add(item);
});

const arr = [1, 2, 3, 4];

// const len = arr.length; // 这样取出来就不会了
// ! push 改变了数组的长度
for (let i = 0; i < arr.length; i++) {
  arr.push(5);
  console.log("kill");
}
