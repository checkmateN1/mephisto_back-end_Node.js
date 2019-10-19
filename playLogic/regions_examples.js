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

// const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2})/;
const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regAllin = /all/i;

console.time('find and replace time pot');
str.forEach(str => {
    if (regAllin.test(str)) {
        console.log(`input: ${str};    output: 0`);
    } else {
        const matchArr = str.match(regPot);
        console.log(`input: ${str};    output: ${matchArr ? matchArr[0]
                .replace(/S/, 5)
                .replace(/D/, 0)
                .replace(/B/, 8)
                .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
            : null}`);
    }
});
console.timeEnd('find and replace time pot');



