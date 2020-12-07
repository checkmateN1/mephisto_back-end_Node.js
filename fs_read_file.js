// const fs = require('fs');
//
// fs.readFile('ttt.txt', 'utf8',
//   (error, data) => {
//     if(error) {
//       console.info('error reading config file: json_config.txt');
//     } else {
//       let str = '{';
//       let sum = 0;
//       data.split('\n').forEach(cur => {
//         const arr = cur.replace('\r', '').split(':');
//         const st = arr[0];
//         const weight = arr[1];
//         sum += +weight;
//         str += `{{"${st[0]}${st[1]}"_c, "${st[2]}${st[3]}"_c, "${st[4]}${st[5]}"_c}, ${weight}},`
//       });
//
//       console.log(sum);
//     }
//   });