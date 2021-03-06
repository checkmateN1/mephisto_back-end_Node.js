// function who() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('🤡');
//     }, 200);
//   });
// }
//
// function what() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('lurks');
//     }, 300);
//   });
// }
//
// function where() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('in the shadows');
//     }, 500);
//   });
// }
//
// const startTime = new Date();
//
// async function msg() {
//   const a = await who();
//   const b = await what();
//   const c = await where();
//
//   console.log(`await msg diff = ${new Date() - startTime}`);
//   console.log(`${ a } ${ b } ${ c }`);
// }
//
// function promiseAll() {
//   const a = who();
//   const b = what();
//   const c = where();
//
//   Promise.all([a, b, c]).then(values => {
//     console.log(values);
//     console.log(`promice diff = ${new Date() - startTime}`);
//     console.log('////////////////////////////////////////////////////////////////////');
//   });
//
//   // console.log(`${ a } ${ b } ${ c }`);
// }
//
// msg(); // 🤡 lurks in the shadows <-- after 1 second
// promiseAll();

console.log(Infinity > 10000);