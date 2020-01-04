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
str[30] = 'Pot: 24 BB 171';           // 24
str[31] = 'POot: 4BB -...';           // 4
str[32] = 'Potz 2 BB';           // 2!
str[33] = '1 Pot: 2 BB';           // 2!
str[34] = 'Pot: 2 8B ..';           // 2!!
str[35] = 'Pot: 1 8.60 BB';           // 18.60
str[36] = 'Pot: 12 BB P';           // 12

// balances
const balances = [];
balances[0] = '7.,.2 BB';          // 7.2
balances[1] = '500';               // 500
balances[2] = '-20,5 BB';          // 20.5
balances[3] = '2 8,0 BB';          // 28.0
balances[4] = '24,0 BB';          // valid test 24.0
balances[5] = '38 4 BB';          // 38.4
balances[6] = '4 8 BB';             // 48
balances[7] = '10.05 BB';          // 10.05
balances[8] = '24.95 BB';          // 24.95
balances[9] = 'S34 BB';          // 34
balances[10] = '15.6 5 BB';          // 15.65
balances[11] = '5.6 5 BB';          // 5.65     test
balances[12] = '5.6 5BB';          // 5.65      test
balances[13] = '16.3 B BB';          // 16.38
balances[14] = '24 5 BB';          // 24.5

// bets
const bets = [];
bets[0] = '19,.1';          // 19.1
bets[1] = 'S5.5 BB';        // 5.5  =(
bets[2] = '24,.5 BD';       // 24.5
bets[3] = '23,2';           // 23.2
bets[4] = '5.,1BB';           // 5.1
bets[5] = '3,5 BB l';           // 3.5
bets[6] = '0.5,BB';           // 0.5
bets[7] = '1BB';           // 1
bets[8] = '1 BB';           // 1


// const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2})/;
const regPot = /(S|D|\d)+(?!\s\d)((\.|\,){0,3}\d{1,2}){0,1}/;
const regAllin = /(all|((4|A)(1|L|I)(1|L|I)-))/i;
const regBalance = /\d+\s{0,1}\d{0,2}(\.|\,){0,3}\d{0,2}/;
const regBet = /\d+(?!([A-Z])){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
// const regBalance = /\d+\S{0,1}\d/;

// pot
str.forEach((str, i) => {
    let clearPot = str.replace(/.*(?=P(0|o|O))/, '').replace(/(?<=\d)\s(?=\d(\.|\,))/, '').replace(/(?<=\d)(\s8B)/, ' BB');   // убрали символы до слова Pot так как бывают цифры + 8B = BB
    const matchPot = clearPot.match(regPot);
    const pot = {
        Pot: matchPot ? Math.round((+matchPot[0]
                .replace(/S/, 5)
                .replace(/D/, 0)
                .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')) * 100)
            : 0,
    };
    console.log(`index: ${i}, input: ${str};    output: ${pot.Pot}`);
});

// // balances
// balances.forEach(str => {
//     if (!regBalance.test(str)) {
//         console.log(`input: ${str};    output: 0 or fail`);
//     } else {
//         const strNew = str.replace(/(?<=\.\d\s)B(?=\sB)/, '8').replace(/(?<=\d{1,2}\.\d)\s(?=\d)/, '');
//         const matchArr = strNew.match(regBalance);
//         console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
//                 .replace(/(\s{1,2})*(?=(\d{0,2}(?=(\.|\,))))/, '')
//                 .replace(/\s(?=\d)/, '')
//                 .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
//             : null}`);
//     }
// });

// bets
// console.log('bets');
// bets.forEach(str => {
//     if (!regBet.test(str)) {
//         console.log(`input: ${str};    output: 0 or fail`);
//     } else {
//         const matchArr = str.match(regBet);
//         console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
//                 .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
//             : null}`);
//     }
// });



