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

const allHandCount = 1326;

const testExpoFunc = () => {
    let sStrategy = Struct({
        invest: int,
        probab: float
    });
    let sStrategyRef = ref.refType(sStrategy);

    let handweight = Struct({
        inputWeight: float,
        strategy: sStrategyRef
    });

    let handweightBuf= new Buffer(handweight.size * 3);

    for (let i = 0; i < 3; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        console.log(el.inputWeight);
        el.strategy = new Buffer(sStrategy.size * 3);
    }

    PokerEngine.GetHill(1, 2, handweightBuf);

    for (let i = 0; i < 3; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        console.log(el.inputWeight);
        for (let j = 0; j < 3; j++) {
            let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
            let ss = sStrategy.get(data3, j * sStrategy.size);
            console.log(`ss.invest: ${ss.invest}`);
            console.log(`ss.probab: ${ss.probab}`);
        }
    }
};

// testExpoFunc();
// let sStrategy = Struct({
//     invest: int,
//     probab: float
// });
// let sStrategyRef = ref.refType(sStrategy);
//
// let handweight = Struct({
//     inputWeight: float,
//     strategy: sStrategyRef
// });
//
// let handweightBuf= new Buffer(handweight.size * 3);
//
// for (let i = 0; i < 3; i++) {
//    let el = handweight.get(handweightBuf, i * handweight.size);
//     console.log(el.inputWeight);
//     el.strategy = new Buffer(sStrategy.size * 3);
// }
//
// PokerEngine.GetHill(1, 2, handweightBuf);
//
// for (let i = 0; i < 3; i++) {
//     let el = handweight.get(handweightBuf, i * handweight.size);
//     console.log(el.inputWeight);
//     for (let j = 0; j < 3; j++) {
//         let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
//         let ss = sStrategy.get(data3, j * sStrategy.size);
//         console.log(`ss.invest: ${ss.invest}`);
//         console.log(`ss.probab: ${ss.probab}`);
//     }
// }

module.exports.testExpoFunc = testExpoFunc;

























