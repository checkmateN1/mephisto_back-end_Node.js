let items = [123, 222];
let item;

let nullCounts = 0;
let oneCounts = 0;

for(let i = 0; i < 10000; i++) {
    item = Math.floor(Math.random()*items.length)
    if (item === 0) {
        nullCounts += 1;
    } else {
        oneCounts += 1;
    }
}

console.log(nullCounts);
console.log(oneCounts);


