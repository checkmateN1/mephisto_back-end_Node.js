// export enum = require('../enum');

// const oldStacks = [
//   '3:3:3',    '6:6:3',    '9:9:3',    '12:12:3',
//   '15:15:3',  '18:18:3',  '21:21:3',  '24:24:3',
//   '27:27:3',  '30:30:3',  '33:33:3',  '36:36:3',
//   '6:6:6',    '9:9:6',    '12:12:6',  '15:15:6',
//   '18:18:6',  '21:21:6',  '24:24:6',  '27:27:6',
//   '30:30:6',  '33:33:6',  '9:9:9',    '12:12:9',
//   '15:15:9',  '18:18:9',  '21:21:9',  '24:24:9',
//   '27:27:9',  '30:30:9',  '33:33:9',  '12:12:12',
//   '15:15:12', '18:18:12', '21:21:12', '24:24:12',
//   '27:27:12', '30:30:12', '15:15:15', '18:18:15',
//   '21:21:15', '24:24:15', '27:27:15', '30:30:15',
//   '18:18:18', '21:21:18', '24:24:18', '27:27:18',
//   '21:21:21', '24:24:21', '27:27:21', '24:24:24'
// ];

const playUtils = Object.freeze({
  getNearestStackComb(stacksArr) {

  },

  createStacksArr(maxSum, step) {
    const arr = [];
    // const arr1 = [];
    // const arr2 = [];
    [...Array(maxSum)].forEach((cur, i) => {
      const min = i + 1;
      [...Array(maxSum)].forEach((cur, middle) => {
        const max = maxSum - middle - min;
        if (middle >= min && max >= middle && (min + middle + max) === maxSum && (min%step === 0) && (middle%step === 0)) {
          arr.push(`${middle}:${middle}:${min}`);
          arr.push(`${middle}:${min}:${middle}`);
          arr.push(`${min}:${middle}:${middle}`);
        }
      });
    });

    return [...new Set(arr)];
  }
});

// console.log(playUtils.createStacksArr(75, 3));

module.exports = playUtils;
