var repl = require('repl');
var ffi = require('ffi');
var ref = require('ref');
var Struct = require('ref-struct');
var ArrayType = require('ref-array');
var int = ref.types.int;
var float = ref.types.float;
var double = ref.types.double;
var CString = ref.types.CString;

var IntArray = ArrayType(int);
var FloatArray = ArrayType(float);
var DoubleArray = ArrayType(double);


var PokerEngine = require('./pokerEngine');
///////////////////////////////////
// let intArr= new Buffer(int.size * 3);
//
// console.log(PokerEngine.TestFunc(intArr));
// console.log(intArr);
// //var data = ref.reinterpret(intArr, int.size * 3, 0);
// let el = int.get(intArr, 2 * int.size);
// console.log(el);
///////////////////////////////////////

let sStrategy = Struct({
    invest: int,
    probab: float
});
let sStrategyRef = ref.refType(sStrategy);
var sStrategyArray = ArrayType(sStrategy);

var handweight = Struct({
    inputWeight: float,
    strategy: sStrategyRef
});

let handweightBuf= new Buffer(handweight.size * 3);

//var data = ref.reinterpret(handweightBuf, handweight.size * allHandCount, 0);
for (var i = 0; i < 3; i++) {
   let el = handweight.get(handweightBuf, i * handweight.size);
    // console.log(data);
    console.log(el.inputWeight);
    el.strategy = new Buffer(sStrategy.size * 3);
}

let result2 = PokerEngine.GetHill(1, 2, handweightBuf);

for (var i = 0; i < 3; i++) {
    let el = handweight.get(handweightBuf, i * handweight.size);
    // console.log(data);
    console.log(el.inputWeight);
    for (let j = 0; j < 3; j++) {
        //
        //console.log(sStrategy.size);
        let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
        let ss = sStrategy.get(data3, j * sStrategy.size);
        console.log(`ss.invest: ${ss.invest}`);
        console.log(`ss.probab: ${ss.probab}`);
    }
}





























