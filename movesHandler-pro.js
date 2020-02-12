const _ = require('lodash');
const uniqid = require('uniqid');

const enumPoker = require('./enum');

addon = require('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon');
addon.SetDefaultDevice('cpu');
// addon.DeserializeBucketingType('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\', 0);
modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RA');
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

const getHandIndex = (handTxt) => {
    let index = textHandsArr.indexOf(handTxt);
    return index > -1 ? index : textHandsArr.indexOf(handTxt.slice(2) + handTxt.slice(0, 2))
};
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

// move_id === мув который хотим симулевать - стратегия.. горбы перемножаем ДО этого мува, поэтому i < maxMove
hillMultiply = (rawActionList, cash, position, move_id) => {
    return rawActionList.reduceRight((hill, move, i) => {
        if (i > 1 && i < move_id && move.position === position) {
            const optimalSizing = move.action < 3 ? getOptimalSizing(rawActionList, cash[i].strategy, move.amount, i) : (move.action === 5 ? -1 : 0);
            const newHill = {};
            Object.keys(hill || cash[i].strategy).forEach(key => {
                newHill[key] = cash[i].strategy[key][optimalSizing] * (hill ? hill[key] : 1);
            });
            return newHill;
        }
        return hill;
    }, null);
};

wasFoldBefore = (position, rawActionList, move) => {
    for (let i = move - 1; i >= 0; i--) {
        if (rawActionList[i].position === position) {
            return rawActionList[i].action === 5;  // fold
        }
    }
    return false;
};

setHills = (addonSetup, initPlayers, rawActionList, cash, move) => {
    initPlayers.forEach(player => {
        if (!wasFoldBefore(player.enumPosition, rawActionList, move)) {
            addonSetup.setHill(position, hillMultiply(rawActionList, cash, player.enumPosition, move));
        }
    });
};

// mock strategy function
mockStrategy = (callBack) => {
    strategy = {                                 // test strategy example
        '1': {
            '0': 0.0011505433459377008,
            '100': 0.0478785282734064,
            '133': 0,
            '200': 0.000045384682651174424,
            '300': 0,
            '2400': 0,
            '-1': 0.9509255436980047
        },
        '2': {
            '0': 0.0011505433459377008,
            '100': 0.0478785282734064,
            '133': 0,
            '200': 0.000045384682651174424,
            '300': 0,
            '2400': 0,
            '-1': 0.9509255436980047
        },
        '3': {
            '0': 0.0011505433459377008,
            '100': 0.0478785282734064,
            '133': 0,
            '200': 0.000045384682651174424,
            '300': 0,
            '2400': 0,
            '-1': 0.9509255436980047
        }
    };
    setTimeout(() => {
        callBack(strategy);
    }, 1000);
};
mockStrategyOne = (callBack) => {
    strategy = {                                 // test strategy example
        '1': {
            '0': 0.0011505433459377008,
            '100': 0.0478785282734064,
            '133': 0,
            '200': 0.000045384682651174424,
            '300': 0,
            '2400': 0,
            '-1': 0.9509255436980047
        }
    };
    setTimeout(() => {
        console.log(`inside timeout mockStrategyOne`);
        callBack(strategy);
    }, 1000);
};

isCashReady = (rawActionList, cash, move_id) => {
    for (let i = 2; i < move_id; i++) {
        if (!cash[i]) {
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

class SimulationsQueue {
    constructor() {
        this.activeSimulations = {};        // handNumber key: [hillRequest1, hillRequest2, ...]
    }

    queueHandler(id, handNumber, callback, simulationArguments) {
        if (!this.activeSimulations[id]) {
            this.activeSimulations[id] = {};
        }
        if (!this.activeSimulations[id][handNumber]) {
            this.activeSimulations[id][handNumber] = {};
            this.activeSimulations[id][handNumber].lockIndexes = [];    // when some simulation/aggregate starts - we lock same index
        }
        if (simulationArguments.needSimulation) {
            this.activeSimulations[id][handNumber][uniqid()] = { callback, simulationArguments };
        }
    };

    lockMove(uniqid, handNumber, move) {
        if (this.activeSimulations[uniqid] && this.activeSimulations[uniqid][handNumber]) {
            this.activeSimulations[uniqid][handNumber].lockIndexes[move] = true;
        }
    }

    isMoveLock(uniqid, handNumber, move) {
        if (this.activeSimulations[uniqid] && this.activeSimulations[uniqid][handNumber]) {
            return this.activeSimulations[uniqid][handNumber].lockIndexes[move];
        }
    }

    deleteTask(uniqid, handNumber, taskID) {
        if (this.activeSimulations[uniqid] && this.activeSimulations[uniqid][handNumber]) {
            delete this.activeSimulations[uniqid][handNumber][taskID];
        }
    }

    checkCallBacks(uniqid, handNumber, playSetup) {
        if (this.activeSimulations[uniqid] && this.activeSimulations[uniqid][handNumber] && Object.keys(this.activeSimulations[uniqid][handNumber]).length > 1) {

            const isIrrelevant = handNumber !== playSetup.handNumber || playSetup.stopPrompt;
            Object.keys(this.activeSimulations[uniqid][handNumber]).forEach(key => {
                if (isIrrelevant) {
                    this.activeSimulations[uniqid][handNumber][key].callback();
                } else if (key !== 'lockIndexes') {
                    const task = this.activeSimulations[uniqid][handNumber][key];
                    const {
                        hand,
                        move_id,
                        playSetup,
                        rawActionList,
                        cash,
                        isNodeSimulation,
                        isHeroTurn,
                    } = task.simulationArguments;

                    if(isCashReady(rawActionList, cash, move_id)) {     // all cash ready before this move
                        if (isNodeSimulation) {task.callback();}        // start callback with simulation waiting - not main callback!

                        if (cash[move_id]) {    // main task finished
                            isHeroTurn ? task.callback(cash[move_id].strategy[getHandIndex(hand)], handNumber, move_id, playSetup) : task.callback();
                            this.deleteTask(uniqid, handNumber, key);
                        }
                    }
                }
            });
            if (isIrrelevant) {
                delete this.activeSimulations[uniqid][handNumber];
            }
            if (Object.keys(this.activeSimulations[uniqid]).length > 1) {
                Object.keys(this.activeSimulations[uniqid]).filter(handNum => handNum !== playSetup.handNumber).forEach(handNumb => {
                    this.checkCallBacks(uniqid, handNumb, playSetup);
                });
            }
        }
    }
}

simulationsQueue = new SimulationsQueue();


perfomancePolicy = Object.freeze({
    prepareCashStrategyStreet: 1,
    startSimulationStreet: 2
});

getCurStreet = (isStrategy, rawActionList, isTerminal) => {
    const lastStreet = rawActionList[rawActionList.length - 1].street;
    return (isStrategy && isTerminal && lastStreet < 3) ? lastStreet + 1 : lastStreet;
};
isNeedCash = (isStrategy, rawActionList, isTerminal) => getCurStreet(isStrategy, rawActionList, isTerminal) >= perfomancePolicy.prepareCashStrategyStreet;
isNeedSimulation = (isStrategy, rawActionList, isTerminal) => getCurStreet(isStrategy, rawActionList, isTerminal) >= perfomancePolicy.startSimulationStreet;
nodeSimulation = (rawActionList, isTerminal, move) => {
    if (rawActionList[move]) {
        return rawActionList[move].street >= perfomancePolicy.startSimulationStreet;
    }
    return rawActionList[move - 1].street + (isTerminal ? 1 : 0) >= perfomancePolicy.startSimulationStreet;
};

// test without aggregator !
const isMockStrategy = true;

const getHill = (request, callback) => {
    const {
        handNumber,
        playSetup,
        rawActionList,
        initPlayers,
        BB,
        board,
        cash,
        move_id,
        move_position,
        heroPosition,
        isTerminal,
        isStrategy,
        hand,
    } = request;

    const { uniqid } = playSetup;

    const needCash = isNeedCash(isStrategy, rawActionList, isTerminal);
    const needSimulation = isNeedSimulation(isStrategy, rawActionList, isTerminal);
    if (heroPosition !== move_position && !needCash) {      // preflop and not hero's turn
        console.log(`inside getHill/// preflop and not hero's turn - send empty callback`);
        console.log(`heroPosition: ${heroPosition}, move_position: ${move_position}`);
        callback();
        return false;
    }

    const isHeroTurn = heroPosition === move_position;
    const simArguments = {
        hand,
        move_id,
        playSetup,
        rawActionList,
        cash,
        needSimulation,
        isHeroTurn,
    };


    simulationsQueue.queueHandler(uniqid, handNumber, callback, simArguments);

    const addonSetup = new addon.Setup(BB/100);

    initPlayers.forEach(player => {
        addonSetup.set_player(player.enumPosition, player.initBalance);
    });


    const movesHandler = () => {
        for (let move = 0; move <= move_id; move++) {
            if (move < 2) {     // 0, 1 - blinds indexes
                const { position, invest, action } = rawActionList[move];
                addonSetup.push_move(position, invest, action);
            } else {
                const isNodeSimulation = nodeSimulation(rawActionList, isTerminal, move);
                if (!cash[move]) {
                    if (needCash && !simulationsQueue.isMoveLock(uniqid, handNumber, move)) {
                        simulationsQueue.lockMove(uniqid, handNumber, move);
                        const getStrategyAsync = (strategy) => {
                            cash[move] = { strategy };

                            simulationsQueue.checkCallBacks(uniqid, handNumber, playSetup);
                            if (isNodeSimulation && move < move_id) {
                                movesHandler();
                            }
                        };

                        // проверить перед отправкой основного коллбека, что
                        if (isNodeSimulation) {
                            if (isCashReady(rawActionList, cash, move)) {
                                if (!isMockStrategy) {
                                    setHills(addonSetup, initPlayers, rawActionList, cash, move);
                                    aggregator.simulate(addonSetup, getStrategyAsync);
                                } else {
                                    mockStrategy(getStrategyAsync);
                                }
                            } else {
                                const simulateCallback = () => {
                                    if (!isMockStrategy) {
                                        setHills(addonSetup, initPlayers, rawActionList, cash, move);
                                        aggregator.simulate(addonSetup, getStrategyAsync);
                                    } else {
                                        mockStrategy(getStrategyAsync);
                                    }
                                };
                                const simArguments = {
                                    move_id: move,          // продумать логически когда move_id === move
                                    rawActionList,
                                    cash,
                                    needSimulation: true,
                                    isNodeSimulation,
                                };
                                simulationsQueue.queueHandler(uniqid, handNumber, simulateCallback, simArguments);
                            }
                            break;      // sync mode
                        } else {
                            if (!isMockStrategy) {
                                aggregator.aggregate_all(addonSetup, getStrategyAsync);
                            } else {
                                mockStrategy(getStrategyAsync);
                            }
                        }
                    }

                    if (move === move_id && !needSimulation && isHeroTurn) {
                        const getOneStrategyAsync = (strategy) => {
                            callback(strategy[Object.keys(strategy)[0]], handNumber, move_id, playSetup);
                        };
                        if (!isMockStrategy) {
                            aggregator.aggregate_one(addonSetup, getOneStrategyAsync, getHandIndex(hand), 'cpu');
                        } else {
                            mockStrategyOne(getOneStrategyAsync);
                        }
                    }

                } else {
                    if (move === move_id && !needSimulation) {
                        const strategy = cash[move].strategy[getHandIndex(hand)];
                        callback(strategy, handNumber, move_id, playSetup);
                    }
                }

                // push moves
                if (rawActionList[move]) {
                    const { position, invest, action, street } = rawActionList[move];
                    addonSetup.push_move(position, invest, action);

                    if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street)
                        || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                        addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards((street + 1), board));
                    }
                }
            }
        }
    };
    movesHandler();
};

module.exports.getHill = getHill;