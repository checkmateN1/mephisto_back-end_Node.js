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

// getting all hands weight
const multiplyStrategy = (request, arrayAllMovesStrategy, investArr) => {
    const allHandsStrategy = {
        allHands: arrayAllMovesStrategy[arrayAllMovesStrategy.length -1].map(hand => Object.assign(hand, {weight: 1})),
    };
    const targetStreet = enumPoker.streets[request.request.street];
    let countMoves = 0;
    let arrMovesActNums = [];
    let prevCountMoves = 0;
    let preflopLength = request.actions.preflop ? request.actions.preflop.length : 0;
    let flopLength = (request.actions.flop ? request.actions.flop.length : 0) + preflopLength;
    let turnLength = (request.actions.turn ? request.actions.turn.length : 0) + flopLength;

    let getRequestPosition = () => {
        let prevLength = 0;
        switch (request.request.street) {
            case 0:
                prevLength = 0;
                break;
            case 1:
                prevLength = preflopLength;
                break;
            case 2:
                prevLength = flopLength;
                break;
            case 3:
                prevLength = turnLength;
                break;
        }
        return request.actions[targetStreet][request.request.act_num - prevLength].position;
    };
    let curRequestPosition = getRequestPosition();
    enumPoker.streets.reduce((prevStreetCount, street) => {
        if (enumPoker.streets.indexOf(street) <= request.request.street) {
            request.actions[street].forEach((move, i) => {
                if (move.action !== 0 && curRequestPosition === move.position && countMoves < request.request.act_num) {
                    arrMovesActNums.push(prevStreetCount + i);
                }
                countMoves++;
            })
        }
        return prevStreetCount + request.actions[street] ? request.actions[street].length : 0;
    }, 0);

    console.log(arrMovesActNums);
    console.log(investArr);
    let arrayAllMovesStrategyMap = [];

    arrayAllMovesStrategy.forEach((allHands, i) => {
        arrayAllMovesStrategyMap[i] = {};
        allHands.forEach(objHand => {
            arrayAllMovesStrategyMap[i][objHand.hand] = objHand;
        })
    });
    let maxWeight = 0;
    let topWeightHand = '';

    arrMovesActNums.forEach(index => {
        allHandsStrategy.allHands.map(hand => {
            let outputWeight = hand.weight * arrayAllMovesStrategyMap[index][hand.hand].moves[1].strategy;
            if (index === arrMovesActNums[arrMovesActNums.length - 1] && outputWeight > maxWeight) {
                maxWeight = outputWeight;
                topWeightHand = hand.hand;
            }
            return Object.assign(hand, {weight: outputWeight});
        });
    });


    //normalize weight
    maxWeight = 1/maxWeight;
    allHandsStrategy.allHands.map(hand => Object.assign(hand, {weight: hand.weight * maxWeight}));

    return allHandsStrategy;
};

const getAllHandsStrategy = (nIDSetup, nIDMove, request, investArr) => {
    console.time("Time this");
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
        arrStrategies.push(Buffer.alloc(sStrategy.size * 3));
    }

    let handweightBuf= Buffer.alloc(handweight.size * allHandsCount);

    for (let i = 0; i < allHandsCount; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        el.strategy = arrStrategies[i];
    }
    console.timeEnd("Time this");

    PokerEngine.GetHill(nIDSetup, nIDMove, handweightBuf);
    console.time("Time this2");
    for (let i = 0; i < allHandsCount; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        allHandsStrategy.allHands[i] = {
            hand: textHandsArr[i],
            weight: el.inputWeight,
            preflopWeight: 1,
            moves: {},
        };
        let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
        for (let j = 0; j < 3; j++) {
            let ss = sStrategy.get(data3, j * sStrategy.size);
            allHandsStrategy.allHands[i].moves[ss.invest] = {strategy: ss.probab};
        }
    }
    console.timeEnd("Time this2");
    let maxInputWeight = 0;
    allHandsStrategy.allHands.forEach(el => {
        if (el.weight > maxInputWeight) maxInputWeight = el.weight;
    });
    for (let i = 0; i < allHandsCount; i++) {
        allHandsStrategy.allHands[i].weight = (allHandsStrategy.allHands[i].weight / maxInputWeight);
    }
    allHandsStrategy.allHands = allHandsStrategy.allHands.filter(el => el.weight >= 0);
    // return allHandsStrategy;

    // new dll array of all moves strategy emulation
    // console.log(request);
    let ArrayAllMovesStrategy = [];

    for (let i = 0; i <= request.request.act_num; i++) {
        ArrayAllMovesStrategy.push(allHandsStrategy.allHands);
    }

    return multiplyStrategy(request, ArrayAllMovesStrategy, investArr);
};

module.exports.getAllHandsStrategy = getAllHandsStrategy;
module.exports.getHandIndex = getHandIndex;




























