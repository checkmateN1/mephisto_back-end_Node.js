var ffi = require('ffi');
var ref = require('ref');
var Struct = require('ref-struct');
var ArrayType = require('ref-array');

var bool = ref.types.bool;
var int = ref.types.int;
var float = ref.types.float;
var double = ref.types.double;

var IntArray = ArrayType(int);
var FloatArray = ArrayType(float);
var DoubleArray = ArrayType(double);

var platform = process.platform;

let intRef = ref.refType(int);

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
let handweightRef = ref.refType(handweight);

var handweightArray = ArrayType(handweight);

let path = './dll/PokerEngine.dll';

let PokerEngine = ffi.Library(path, {
    "SetPlayer" : [int, [int, int, int, FloatArray]],
    //"GetHill": [bool, [int, int, handweightArray]],
    "GetHill": [bool, [int, int, handweightRef]],
    //"getarray": [ArrayType(int, 3), []],
    "TestFunc": [ref.types.void, [intRef]],
    "InitSetup": [int, []],
    "ReleaseSetup": [bool, [int]],
});
module.exports = PokerEngine;


//var array = ref.alloc(double, 3);
// var array2 = ref.alloc(handweight, 1326);
//
//
// var data = ref.reinterpret(array2, handweight.size * 1326, 0);
// for (var i = 0; i < 3; i++) {
//     let el = handweight.get(data, i * handweight.size);
//     el.inputWeight = 666;
//     el.strategy = ref.alloc(sStrategy, 3);
// }
//
// //let result2 = PokerEngine.GetHill(1, 2, array2);
//
// for (var i = 0; i < 3; i++) {
//     console.log(handweight.get(data, i * handweight.size));
// }










// player
// int id setup, int id, int stack, int pos, FloatArray

//move
// id int,

// POKERENGINE_API bool SetPlayer(int nIDSetup, int nStack, int nPos, float arrAdapt[ADAPT_SIZE]);
//
// POKERENGINE_API int InitSetup();
// POKERENGINE_API bool ReleaseSetup(int nIDSetup);
//
// POKERENGINE_API int PushMove(int nIDSetup, int nMoney);
// POKERENGINE_API int PushHintMove(int nIDSetup, int nMoney, int nPos, int nAct);
// POKERENGINE_API int PushBoard3Move(int nIDSetup, int c1, int c2, int c3);
// POKERENGINE_API int PushBoard1Move(int nIDSetup, int c1);
// POKERENGINE_API bool PopMove(int nIDSetup);
//
// POKERENGINE_API bool GetHill(int nIDSetup, int nIDMove, float arrHill[1326]);






// Дмитрий Онуфриев, [25.11.18 21:27]
// enum EDealPos: char
// {
//     DEALPOS_NONE = -1,
//         DEALPOS_BTN = 0,
//         DEALPOS_CO = 1,
//         DEALPOS_MP3 = 2,
//         DEALPOS_MP2 = 3,
//         DEALPOS_MP1 = 4,
//         DEALPOS_UTG2 = 5,
//         DEALPOS_UTG = 6,
//         DEALPOS_BB = 8,
//         DEALPOS_SB = 9,
//         DEALPOS_FLOP = 13,
//         DEALPOS_TURN = 14,
//         DEALPOS_RIVER = 15,
// };
//
// Дмитрий Онуфриев, [25.11.18 21:27]
// enum EMoves: char
// {
//     ACT_NONE = -1,
//         ACT_POST = 0,
//         ACT_BET = 1,
//         ACT_RAISE = 2,
//         ACT_CALL = 3,
//         ACT_CHECK = 4,
//         ACT_FOLD = 5,
//         ACT_ALLIN = 6
// };

