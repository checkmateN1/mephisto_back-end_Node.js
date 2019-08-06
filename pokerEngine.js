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

let hand = Struct({
    hi: ref.types.char,
    lo: ref.types.char
});

let sStrategyRef = ref.refType(sStrategy);
let handRef = ref.refType(hand);

var handweight = Struct({
    inputWeight: float,
    strategy: sStrategyRef
});
let handweightRef = ref.refType(handweight);

let path = './dll/PokerEngine.dll';

let PokerEngine = ffi.Library(path, {
    "SetPlayer" : [int, [int, int, int, FloatArray]],
    "GetHill": [bool, [int, int, handweightRef]],
    "GetHandsDict": [ref.types.void, [handRef]],
    "PushHintMove": [int, [int, int, int, int]],
    "PushBoard3Move": [int, [int, int, int, int]],
    "PushBoard1Move": [int, [int, int]],
    "InitSetup": [int, [int]],
    "ReleaseSetup": [bool, [int]],
});
module.exports = PokerEngine;







// player
// int id setup, int id, int stack, int pos, FloatArray

//move
// id int,

// POKERENGINE_API bool SetPlayer(int nIDSetup, int nStack, int nPos, float arrAdapt[ADAPT_SIZE]);
//
// POKERENGINE_API void GetHandsDict(SHiLoCards* dict);
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
// POKERENGINE_API int GetLastMoveId(int nIDSetup);   /// NEW

// enum EMoves: char
// {
//         ACT_NONE = -1,
//         ACT_POST = 0,
//         ACT_BET = 1,
//         ACT_RAISE = 2,
//         ACT_CALL = 3,
//         ACT_CHECK = 4,
//         ACT_FOLD = 5,
//         ACT_ALLIN = 6
// };




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

