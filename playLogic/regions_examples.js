// pot
const str = [];
str[0] = 'Pot- 4,0 BB';          // 4.0
str[1] = 'Pot 8.0 BB';          // 8.0
str[2] = 'Port 60';             // 60
str[3] = 'Pot12,0 BB';          // 12.0
str[4] = 'Potz 21.5 BB';        // 21.5
str[5] = 'Pot 3.,0 BB';         // 3.0
str[6] = 'Potc25,.5 BB';        // 25.5
str[7] = 'POL3.0 BB';           // 3.0
str[8] = 'Pot_7,.,0 BB';        // 7.0
str[9] = 'Pot-7.2 BB';         // 7.2
str[10] = 'Port 11,8 BB';       // 11.8
str[11] = 'Pot-.-17.9BB';       // 17.9       !!
str[12] = 'Polt, 3,0 BB';       // 3.0
str[13] = 'Pot2 6,0 BB';        // 6.0        !!
str[14] = 'Pot2 3,0 BB';        // 3.0        !!
str[15] = 'Pot_30';             // 30
str[16] = 'PotS,5 BB';          // 5.5        !!
str[17] = '16,0 BB';            // 16.0       !!
str[18] = 'Pot 10,0 BB';        // 10.0       default
str[19] = '';                   // empty
str[20] = 'fgsvs';              // text
str[21] = 'PotC3,0 BB';              // 3.0
str[22] = 'Potz 7.2.BB';              // 7.2
str[23] = 'Potz 0 BB';              // 0
str[24] = 'All-in';                  // 0
str[25] = 'Pot 4,0 BB 4...';                  // 4.0
str[26] = 'Pot: B,0 BB .,';                  // 8.0
str[27] = '23 0 BB';                  // 23.0
str[28] = '411-111';                  // All-in
str[29] = 'A11-111';                  // All-in

// balances
const balances = [];
balances[0] = '7.,.2 BB';          // 7.2
balances[1] = '500';               // 500
balances[2] = '-20,5 BB';          // 20.5
balances[3] = '2 8,0 BB';          // 28.0
balances[4] = '24,0 BB';          // valid test 24.0
balances[5] = '38 4 BB';          // 38.4


// bets
const bets = [];
bets[0] = '19,.1';          // 19.1
bets[1] = 'S5.5 BB';        // 5.5  =(
bets[2] = '24,.5 BD';       // 24.5
bets[3] = '23,2';           // 23.2
bets[4] = '5.,1BB';           // 5.1
bets[5] = '3,5 BB l';           // 3.5
bets[6] = '0.5,BB';           // 0.5


// const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2})/;
const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regAllin = /(all|((4|A)(1|L|I)(1|L|I)-))/i;
const regBalance = /(S|D|B|\d)+\s{0,1}\d{0,2}(\.|\,){0,3}\d{0,1}/;
const regBet = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
// const regBalance = /\d+\S{0,1}\d/;

// pot
// str.forEach(str => {
//     if (regAllin.test(str)) {
//         console.log(`input: ${str};    output: 0`);
//     } else {
//         const matchArr = str.match(regPot);
//         console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
//                 .replace(/S/, 5)
//                 .replace(/D/, 0)
//                 .replace(/B/, 8)
//                 .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
//             : null}`);
//     }
// });

// // balances
// console.log('balances');
// balances.forEach(str => {
//     if (!regBalance.test(str)) {
//         console.log(`input: ${str};    output: 0 or fail`);
//     } else {
//         const matchArr = str.match(regBalance);
//         console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
//                 .replace(/(\s{1,2})*(?=(\d{0,2}(?=(\.|\,))))/, '')
//                 .replace(/(\.|\,|\s)+(?=(\d)){0,1}/, '.')
//             : null}`);
//     }
// });

// bets
console.log('bets');
bets.forEach(str => {
    if (!regBet.test(str)) {
        console.log(`input: ${str};    output: 0 or fail`);
    } else {
        const matchArr = str.match(regBet);
        console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
                .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
            : null}`);
    }
});



