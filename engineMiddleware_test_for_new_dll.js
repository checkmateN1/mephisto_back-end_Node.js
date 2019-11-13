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
var enumPoker = require('./enum');

const allHandsCount = 1326;

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
    let handArr = Buffer.alloc(hand.size * allHandsCount);
    PokerEngine.GetHandsDict(handArr);

    for (let i = 0; i < allHandsCount; i++) {
        let el = hand.get(handArr, i * hand.size);
        textHandsArr[i] = getCardText(parseInt(el.hi));
        textHandsArr[i] += getCardText(parseInt(el.lo));
    }
    console.log('fill dict completed');
};
fillDict();

const getHandIndex = (handTxt) => {
    let index = textHandsArr.indexOf(handTxt);
    return index > -1 ? index : textHandsArr.indexOf(handTxt.slice(2) + handTxt.slice(0, 2))
};


const getAllHandsStrategy = (sizings) => {
    let allHandsStrategy = {
        allHands: []
    };

    let sStrategy = Struct({
        invest: int,
        probab: float
    });
    let sStrategyRef = ref.refType(sStrategy);

    let handweight = Struct({
        inputWeight: float,
        strategy: sStrategyRef
    });

    let arrStrategies = [];
    for (let i = 0; i < allHandsCount; i++) {
        arrStrategies.push(Buffer.alloc(sStrategy.size * sizings.length));
    }

    let handweightBuf= Buffer.alloc(handweight.size * allHandsCount);

    const testAllHandsArr = Buffer.alloc(float.size * allHandsCount);

    for (let i = 0; i < allHandsCount; i++) {
        let el = float.get(testAllHandsArr, i * float.size);
        // console.log(el);
    }

    // var buf = Buffer.alloc(40);
    // for (let i = 0; i < 10, i++;) {
    //     buf.writeFloatLE(0xdeadbeefcafebabe, 12);
    // }

    const buf = Buffer.alloc(12);

    Array(3).fill().forEach((cur, i) => {
        buf.writeFloatBE(19.555, i * 4);
    });

    // buf.writeFloatBE(19.555, 0);
    // buf.writeFloatBE(19.555, 4);
    // buf.writeFloatBE(19.555, 8);

    console.log(buf);
    console.log(float.size);

    // for (let i = 0; i < 100, i++;) {
    //     let el = float.get(buf, i * 4);
    //     console.log(el);
    // }

    // console.log(buf);
    // console.log(buf.toString('hex'));
    // console.log(buf);
    //
    // buf.writeFloatLE(0xcafebabe, 0);

    // console.log(buf.toJSON());

    // for (let i = 0; i < allHandsCount; i++) {
    //     let el = handweight.get(handweightBuf, i * handweight.size);
    //     el.strategy = arrStrategies[i];
    // }

    // PokerEngine.GetHill(1, 1, handweightBuf);

    // for (let i = 0; i < allHandsCount; i++) {
    //     let el = handweight.get(handweightBuf, i * handweight.size);
    //     // console.log(el.inputWeight);
    //     allHandsStrategy.allHands[i] = {
    //         hand: textHandsArr[i],
    //         weight: el.inputWeight,
    //         preflopWeight: 1,
    //         moves: {},
    //     };
    //     let data3 = ref.reinterpret(el.strategy, sStrategy.size * sizings.length, 0);
    //     for (let j = 0; j < sizings.length; j++) {
    //         let ss = sStrategy.get(data3, j * sStrategy.size);
    //         allHandsStrategy.allHands[i].moves[ss.invest] = {strategy: ss.probab};
    //     }
    // }
    // let maxInputWeight = 0;
    // allHandsStrategy.allHands.forEach(el => {
    //     if (el.weight > maxInputWeight) maxInputWeight = el.weight;
    // });
    // for (let i = 0; i < allHandsCount; i++) {
    //     allHandsStrategy.allHands[i].weight = (allHandsStrategy.allHands[i].weight / maxInputWeight);
    // }
    // console.log('allHandsStrategy');
    // // console.log(allHandsStrategy);

};

getAllHandsStrategy([-1, 0, 1]);





























