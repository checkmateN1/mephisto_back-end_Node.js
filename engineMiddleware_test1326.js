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

const allHandsCount = 1326;

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

    let handweightBuf= new Buffer(handweight.size * allHandsCount);

    for (let i = 0; i < allHandsCount; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        //el.strategy = new Buffer(sStrategy.size * 3);
        el.strategy = new Buffer(sStrategy.size * 3);
    }

    PokerEngine.GetHill(1, 2, handweightBuf);

    /*for (let i = 0; i < allHandsCount; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        console.log(el.inputWeight);
        let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
        for (let j = 0; j < 3; j++) {
            let ss = sStrategy.get(data3, j * sStrategy.size);
            console.log(`ss.invest: ${ss.invest}`);
            console.log(`ss.probab: ${ss.probab}`);
        }
    }*/
};

//testExpoFunc();

const getCardText = (cardNumber) => {
    let cardText = '';
    switch (cardNumber % 13) {
        case 12:
            cardText = 'A';
            break;
        case 11:
            cardText = 'K';
            break;
        case 10:
            cardText = 'Q';
            break;
        case 9:
            cardText = 'J';
            break;
        case 8:
            cardText = 'T';
            break;
        default:
            cardText = (cardNumber % 13 + 2);
    }

    switch (Math.floor(cardNumber / 13))
    {
        case 0:
            cardText += 'h';
            break;
        case 1:
            cardText += 'd';
            break;
        case 2:
            cardText += 'c';
            break;
        case 3:
            cardText += 's';
            break;
    }
    return cardText;
};

let textHandsArr = [];

const fillDict = () => {
    let hand = Struct({
        hi: ref.types.char,
        lo: ref.types.char
    });
    let handArr = new Buffer(hand.size * allHandsCount);
    PokerEngine.GetHandsDict(handArr);

    for (let i = 0; i < allHandsCount; i++) {
        let el = hand.get(handArr, i * hand.size);
        textHandsArr[i] = getCardText(parseInt(el.hi));
        textHandsArr[i] += getCardText(parseInt(el.lo));
    }
};
fillDict();

const getHandIndex = (handTxt) => {
    let index = textHandsArr.indexOf(handTxt);
    return index > -1 ? index : textHandsArr.indexOf(handTxt.slice(2) + handTxt.slice(0, 2))
};
console.log(getHandIndex('7d7h'));


























