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
//console.log(PokerEngine.InitSetup());
// var result = null;
// var result2 = null;
//
// var b = [1.1, 999.7, 3.3];
// var arrInt = new IntArray(b);
// result = PokerEngine.SetPlayer(5, 5, 5, arrInt);


// var a = [0.1, 1.1];
// var array = ref.alloc(double, 3);
//
// result2 = PokerEngine.GetHill(array);
//
// var data = ref.reinterpret(array, double.size * 3, 0);
// for (var i = 0; i < 3; i++) {
//     console.log(double.get(data, i * double.size));
// }
var countSizing = 3;

let sStrategy = Struct({
    invest: int,
    probab: float
});
//let sStrategyPTR = ref.refType(sStrategy);

var sStrategyArray = ArrayType(sStrategy, countSizing);



var handweight = Struct({
    inputWeight: float,
    strategy: sStrategyArray
});
var handweightArray = ArrayType(handweight);

var allHandCount = 3;

var array2 = ref.alloc(handweight, allHandCount);
//var array2 = new Buffer(handweight.size * allHandCount);
console.log(handweight.size);
//

//var data = ref.reinterpret(array2, handweight.size * allHandCount, 0);
//for (var i = 0; i < allHandCount; i++) {
//    let el = handweight.get(data, i * handweight.size);
    //console.log(data);
    //console.log(el);
  //  el.inputWeight = 666;
    //console.log(`el.strategy: ${el.strategy}`);
    //el.strategy = new Buffer(sStrategy.size * countSizing);
    //el.strategy = ref.alloc(sStrategy, countSizing);
    //console.log(data);

    //console.log(`el.strategy: ${el.strategy}`);
//}
//console.log('yo');
//for (var i = 0; i < allHandCount; i++) {
//    console.log(handweight.get(data, i * handweight.size));
//}
//

let result2 = PokerEngine.GetHill(1, 2, array2);
var data = ref.reinterpret(array2, handweight.size * 3, 0);
//console.log('yo');
console.log(data);
for (var i = 0; i < 3; i++) {
    let hw = handweight.get(data, i * handweight.size);
    console.log(hw.inputWeight);
    var data2 = ref.reinterpret(hw.strategy.buffer, sStrategy.size * countSizing, 0);
    //console.log(data2);
    //console.log(hw.strategy);
    //console.log(hw.strategy);
     for (let j = 0; j < countSizing; j++) {
    //
         //console.log(sStrategy.size);
         let ss = sStrategy.get(data2, j * sStrategy.size);
         console.log(`ss.invest: ${ss.invest}`);
         console.log(`ss.probab: ${ss.probab}`);
     }
    // console.log(handweight.get(data, i * handweight.size));
}


























// var result = null;
// var result2 = null;
//
// var b = [1.1, 999.7, 3.3];
// var arrInt = new IntArray(b);
// result = PokerEngine.SetPlayer(5, 5, 5, arrInt);
//
// var a = [0.1, 1.1];
// var array = ref.alloc(double, 3);
//
// result2 = PokerEngine.GetHill(array);
// var data = ref.reinterpret(array, double.size * 3, 0);
// for (var i = 0; i < 3; i++) {
//     console.log(double.get(data, i * double.size));
// }