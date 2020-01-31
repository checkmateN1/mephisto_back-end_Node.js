// const PokerEngine = require('./pokerEngine');  // molotok
// const middleware = require('./engineMiddleware_work');   // molotok
const enumPoker = require('./enum');

const _ = require('lodash');
const adapt_size = 10;

addon = require('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon');
addon.SetDefaultDevice('cpu');
// addon.DeserializeBucketingType('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\', 0);
modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RN');
aggregator = new addon.RegretPoolToStrategyAggregator( modelsPool );
// const setup = new addon.Setup(1);
// setup.set_player(0,2500);
// setup.set_player(8,2500);
// setup.push_move(0, 50, 0);
// setup.push_move(8, 100, 0);
// strategy = aggregator.aggregate_all(setup);

// console.log('test strategy');
// console.log(strategy);

const handsDict = addon.GetHandsDict();

// console.log(handsDict);

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

const textHandsArr = [];
const fillDict = () => {
    for (let i = 0; i < allHandsCount; i++) {
        textHandsArr[i] = getCardText(parseInt(handsDict[i].hi));
        textHandsArr[i] += getCardText(parseInt(handsDict[i].lo));
    }
    console.log('fill dict completed');
};
fillDict();

// const getHandIndex = (handTxt) => {
//     let index = textHandsArr.indexOf(handTxt);
//     return index > -1 ? index : textHandsArr.indexOf(handTxt.slice(2) + handTxt.slice(0, 2))
// };

// console.log(`6h4h: ${getHandIndex('6h4h')}`);       // 258
// console.log(`AhAd: ${getHandIndex('AhAd')}`);       // 0

// console.log('textHandsArr[656]');
// console.log(textHandsArr[656]);

getNearestSizing = (strategy, cur) => {     // возвращает ближайший АГРО!!-сайзинг к текущему
    let closedSizing = 100500;
    Object.keys(strategy).reduce((min, current) => {
        const diff = Math.abs(parseInt(cur) - parseInt(current));
        if (diff < min && parseInt(current) > 0) {      // чекаем только агросайзинги в стратегии
            closedSizing = parseInt(current);
            return diff;
        } else {
            return min;
        }
    }, 100500);

    return closedSizing;
};

getOptimalSizing = (rawActionList, strategy, amount, move) => {
    const maxAmount = getMaxAmountBeforeMove(rawActionList, move);
    const sizing = amount > maxAmount ? amount - maxAmount : 0;     // превышение над максимальной ставкой
    const example = strategy[Object.keys(strategy)[0]];

    return getNearestSizing(example, sizing);
};

getMaxAmountBeforeMove = (rawActionList, move) => {
    const currentStreet = rawActionList[move].street;
    for (let i = move - 1; i > 0; i--) {
        if (rawActionList[i].street === currentStreet) {
            if (rawActionList[i].action < 3) {
                return rawActionList[i].amount;
            }
        } else {
            return 0;
        }
    }
    return 0;
};

hillMultiply = (position, curInvest, movesCount, setup) => {
    console.log(`start getHill! MovesCount: ${movesCount}, movesInEngine: ${setup.movesInEngine}`);
    if (setup.hillsCash[movesCount]) {      // есть, но без optimalSizing
        // strategy = setup.hillsCash[movesCount].cash;
    }
    const strategy = aggregator.aggregate_all(setup.addonSetup);
    console.log(`get strategy success!`);

    // if (movesCount === 3) {
    // console.log(`node bet 2BB with 6h4h`);
    // console.log(strategy[258]);
    // console.log(`node bet 2BB with AA`);
    // console.log(strategy[0]);
    // console.log(strategy);
    // }

    // console.log(`strategy after movesCount: ${movesCount}`);
    // console.log(strategy);

    // ищем есть ли в setup.hillsCash совпадение по позициям и если да - берем горб из объекта с самым высоким индексом
    const index = setup.hillsCash.reduceRight((index, cur, i) => {
        if (index === -1) {
            if (cur.position === position && movesCount > i) {
                return i;
            }
        }
        return index;
    }, -1);

    const example = strategy[Object.keys(strategy)[0]];
    const optimalSizing = getSizing(example, curInvest);

    // console.log('example');
    // console.log(example);
    // console.log(`optimalSizing: ${optimalSizing}, prevIndexInCash: ${index}`);

    return textHandsArr.map((hand, i) => {
        let weight;
        let strat;
        if (!(i in strategy)) {
            weight = -1;
            strat = {};
        } else {
            // console.log(`setup.engineID: ${setup.engineID}, nIdMove: ${nIdMove}`);
            // console.log(hand);
            // strategy = {                                 // test strategy example
            //     '1325': {
            //         '0': 0.0011505433459377008,
            //         '100': 0.0478785282734064,
            //         '133': 0,
            //         '200': 0.000045384682651174424,
            //         '300': 0,
            //         '2400': 0,
            //         '-1': 0.9509255436980047
            //     }
            // };
            // текущий вес ноды руки!
            weight = (index !== -1 && index > 1) ? setup.hillsCash[index].cash[i].weight * setup.hillsCash[index].cash[i].strategy[setup.hillsCash[index].cash[i].optimalSizing] : 1;
            strat = strategy[i];
            // if (i === 0) {      // 258 - 64, 0 - AA
            //     console.log(`prev AA weight: ${weight}`);
            // }
            // if (i === 656) {      // 258 - 64, 0 - AA
            //     console.log(`prev A4 stragegy`);
            //     console.log(strat);
            // }
        }
        return { hand, weight, strategy: strat, optimalSizing };
    });
};

isCashEqual = (rawActionList, cash, indexTo) => {
    for (let i = 0; i >= indexTo; i++) {
        if (!_.isEqual(rawActionList[i], cash[i].rawAction)) {
            return false;
        }
    }
    return true;
};

getBoardDealPosition = (street) => {
    switch (street) {
        case 1:
            return enumPoker.enumPoker.dealPositions.DEALPOS_FLOP;
        case 2:
            return enumPoker.enumPoker.dealPositions.DEALPOS_TURN;
        case 3:
            return enumPoker.enumPoker.dealPositions.DEALPOS_RIVER;
    }
};

getPushBoardCards = (street, board) => {
    switch (street) {
        case 1:
            return [enumPoker.enumPoker.cardsName.indexOf(board[0].value.toUpperCase() + board[0].suit),
                    enumPoker.enumPoker.cardsName.indexOf(board[1].value.toUpperCase() + board[1].suit),
                    enumPoker.enumPoker.cardsName.indexOf(board[2].value.toUpperCase() + board[2].suit)];
        case 2:
            return [enumPoker.enumPoker.cardsName.indexOf(board[3].value.toUpperCase() + board[3].suit)];
        case 3:
            return [enumPoker.enumPoker.cardsName.indexOf(board[4].value.toUpperCase() + board[4].suit)];
    }
};

const perfomancePolicy = Object.freeze({
    oneHandStrategyStreet: [0, 1],
    prepareCashStrategyStreet: 1,
    simulationsStreet: [2, 3],
});

// запрашиваем только реально сделанные мувы
/// проследить, чтобы в терминальном состоянии вызывать getHill/strategy только когда появится карта борда
const getHill = (handNumber, setup, rawActionList, BB, board, hillsCash, move_id, isTerminal, isStrategy, isOneHandStrategy, hand, usePerfomancePolicy, callback, position) => {    // move_id - для стратегии следующий, для горба текущийы
    let hill = {};
    const addonSetup = new addon.Setup(BB/100);

    const fillCash = (position) => {    // опциональный параметр - можно заполнять всем - можно только конкретному игроку
        for (let move = 2; move <= move_id; move++) {       // 0, 1 - blinds id
            if ((position !== undefined && rawActionList[move] && position === rawActionList[move].position) || position === undefined) {  // fill all or fill position
                const { position, invest, amount, action, street } = rawActionList[move];

                if (!hillsCash[move] || !isCashEqual(rawActionList, hillsCash, move)) {
                    const getStrategyAsync = (strategy) => {
                        if (isStrategy && move === move_id) {
                            callback(strategy, handNumber, move_id);
                            if (!isOneHandStrategy) {       // не кэшируем одну руку
                                hillsCash[move] = { strategy };
                            }
                        } else {
                            addonSetup.push_move(position, invest, action);
                            if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street) || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                                addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards(street + 1));
                            }

                            const optimalSizing = getOptimalSizing(rawActionList, strategy, amount, move);
                            hillsCash[move] = { strategy, rawAction: rawActionList[move], optimalSizing  };     // isCashEqual needs rawAction for comparing

                            hill = hillMultiply(hill, strategy, optimalSizing);
                            move === move_id ? callback(hill, handNumber, move_id) : fillCash();
                        }
                    };

                    aggregator.aggregate_all(addonSetup, getStrategyAsync);
                    break;

                } else {        // have cash
                    const strategy = hillsCash[move].strategy;
                    if (isStrategy && move === move_id) {
                        callback(strategy, handNumber, move_id);
                    } else {
                        addonSetup.push_move(position, invest, action);
                        if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street) || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                            addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards(street + 1));
                        }

                        if (!hillsCash[move].rawAction) {       // cash: { strategy }
                            hillsCash[move].rawAction = rawActionList[move];
                            hillsCash[move].optimalSizing = getOptimalSizing(rawActionList, strategy, amount, move);
                        }

                        hill = hillMultiply(hill, strategy, hillsCash[move].optimalSizing);
                        if (move === move_id) {
                            callback(hill, handNumber, move_id);
                        }
                    }
                }
            }
        }
    };
    fillCash(position);
};


const movesHandlerPro = (setup) => {
    console.log(`enter moves handler PRO!!`);

    const {
        rawActionList,
        hillsCash,
        bbSize,
        initPlayers,
        heroChair,
    } = setup;

    const BB = bbSize[bbSize.length - 1];
    const heroEnumPosition = initPlayers[heroChair].enumPosition;



    //////////////////////////////////////// PUSH FLOP BOARD
    if (request.actions.flop || (request.board.c1 && nodeId === movesCount + 1)) {

        const flopPush = setup.addonSetup.push_move(
            enumPoker.enumPoker.dealPositions.DEALPOS_FLOP,
            enumPoker.enumPoker.cardsName.indexOf(request.board.c1),
            enumPoker.enumPoker.cardsName.indexOf(request.board.c2),
            enumPoker.enumPoker.cardsName.indexOf(request.board.c3)
        );
    }

    //////////////////////////////////////// PUSH TURN
    if (request.actions.turn) {
        if (request.board.c4 !== setup.movesCash.c4) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 1, setup);
                setup.movesCash.turn = [];
                setup.movesCash.river = [];
                setup.movesCash.c5 = null;
            }
            isCashSteelUseful = false;
            const turnBoard = setup.addonSetup.push_move(enumPoker.enumPoker.dealPositions.DEALPOS_TURN, enumPoker.enumPoker.cardsName.indexOf(request.board.c4));
            console.log('turnBoard');
            console.log(turnBoard);
            setup.movesCash.c4 = request.board.c4;
            setup.movesInEngine++;
        }

    }

    //////////////////////////////////////// PUSH RIVER
    if (request.actions.river) {
        if (request.board.c5 !== setup.movesCash.c5) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 2, setup);
                setup.movesCash.river = [];
            }
            isCashSteelUseful = false;

            const riverBoard = setup.addonSetup.push_move(enumPoker.enumPoker.dealPositions.DEALPOS_RIVER, enumPoker.enumPoker.cardsName.indexOf(request.board.c5));
            console.log('riverBoard');
            console.log(riverBoard);
            setup.movesCash.c5 = request.board.c5;
            setup.movesInEngine++;
        }
    }
};

module.exports.movesHandlerPro = movesHandlerPro;