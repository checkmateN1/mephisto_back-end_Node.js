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
    const strategy = {                                 // test strategy example
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
    }, 1500);
};
mockStrategyOne = (callBack) => {
    const strategy = {                                 // test strategy example
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
    }, 300);
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
    queueHandler(playSetup, handNumber, callback, simulationArguments) {
        if (playSetup) {
            if (!playSetup.activeSimulations) {
                playSetup.activeSimulations = {};
            }
            if (!playSetup.activeSimulations[handNumber]) {
                playSetup.activeSimulations[handNumber] = {};
                playSetup.activeSimulations[handNumber].lockIndexes = [];    // when some simulation/aggregate starts - we lock same index
            }
            if (simulationArguments.needSimulation) {
                playSetup.activeSimulations[handNumber][uniqid()] = { callback, simulationArguments };
            }
        }
    };

    lockMove(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            playSetup.activeSimulations[handNumber].lockIndexes[move] = true;
        }
    }

    isMoveLock(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            return playSetup.activeSimulations[handNumber].lockIndexes[move];
        }
    }

    deleteTask(playSetup, handNumber, taskID) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            delete playSetup.activeSimulations[handNumber][taskID];
        }
    }

    checkCallBacks(playSetup, handNumber) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            const isIrrelevant = handNumber !== playSetup.handNumber || playSetup.stopPrompt;
            Object.keys(playSetup.activeSimulations[handNumber]).forEach(key => {
                if (isIrrelevant) {
                    playSetup.activeSimulations[handNumber][key].callback();
                } else if (key !== 'lockIndexes') {
                    const task = playSetup.activeSimulations[handNumber][key];
                    const {
                        hand,
                        move_id,
                        rawActionList,
                        cash,
                        isNodeSimulation,
                        isHeroTurn,
                    } = task.simulationArguments;

                    if(isCashReady(rawActionList, cash, move_id)) {     // all cash ready before main request move
                        if (isNodeSimulation) {     // start callback with simulation - not main callback!
                            task.callback();
                        } else if (cash[move_id]) {    // main task finished
                            isHeroTurn ? task.callback(cash[move_id].strategy[getHandIndex(hand)], handNumber, move_id, playSetup) : task.callback();
                            this.deleteTask(playSetup, handNumber, key);
                        }
                    }
                }
            });

            if (isIrrelevant) {
                delete playSetup.activeSimulations[handNumber];
            }

            if (Object.keys(playSetup.activeSimulations).length > 1) {       // если у стола есть еще нерелевантные руки с запросами
                Object.keys(playSetup.activeSimulations).filter(handNum => handNum !== playSetup.handNumber).forEach(handNumb => {
                    this.checkCallBacks(playSetup, handNumb);
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
        rawActionList,
        cash,
        needSimulation,
        isHeroTurn,
    };


    simulationsQueue.queueHandler(playSetup, handNumber, callback, simArguments);

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
                    if (needCash && !simulationsQueue.isMoveLock(playSetup, handNumber, move)) {
                        simulationsQueue.lockMove(playSetup, handNumber, move);
                        const getStrategyAsync = (strategy) => {
                            cash[move] = { strategy };

                            simulationsQueue.checkCallBacks(playSetup, handNumber);
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
                                simulationsQueue.queueHandler(playSetup, handNumber, simulateCallback, simArguments);
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

                // push moves and board
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