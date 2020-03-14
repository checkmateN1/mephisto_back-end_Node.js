const _ = require('lodash');
const uniqid = require('uniqid');

const enumPoker = require('./enum');

addon = require('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon');
addon.SetDefaultDevice('cpu');
// addon.DeserializeBucketingType('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\', 0);
// modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RA');
modelsPoolSync = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RA');
// aggregator = new addon.RegretPoolToStrategyAggregator( modelsPool );
aggregatorSync = new addon.RegretPoolToStrategyAggregator( modelsPoolSync );
// setup = new addon.Setup(1.0);
// setup.set_player(8, 2500)
// setup.set_player(0, 2500)
// setup.set_player(9, 2500)
// setup.push_move(9, 50, 0)
// setup.push_move(8, 100, 0)
// setup.push_move(0, 200, 2)
//
// regret = aggregatorSync.random_model_regret(setup, 524) // 2nd - hand
// console.log('test regret');
// console.log(regret);


class AggregatorPool {
    constructor() {
        this.pool = {};
        Array(enumPoker.enumPoker.perfomancePolicy.maxActiveTasks).fill().forEach((cur, index) => {
            const modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RA');
            this.pool[index] = {
                modelsPool,
                aggregator: new addon.RegretPoolToStrategyAggregator( modelsPool ),
                isLock: false,
            }
        });
    }

    isFree() {
        for (let key in this.pool) {
            if (!this.pool[key].isLock) {
                return true;
            }
            return false;
        }
    }

    getFreeKey() {
        for (let key in this.pool) {
            if (!this.pool[key].isLock) {
                this.pool[key].isLock = true;
                return key;
            }
        }
    }

    unlock(key) {
        this.pool[key].isLock = false;
    }
}

const aggregatorPool = new AggregatorPool();

class TasksQueue {
    constructor(aggregatorPool) {
        this.activeSimulations = [];
        this.simulationsQueue = [];
        this.aggregatorPool = aggregatorPool;
    }

    tasksHandler() {
        if (this.aggregatorPool.isFree() && this.activeSimulations.length < enumPoker.enumPoker.perfomancePolicy.maxActiveSimulations) {
            const task = this.simulationsQueue.shift();
            if (task) {
                this.activeSimulations.push(task);
                task.callback();
            }
        }
    }

    queueHandler(handNumber, move_id, callback) {
        this.simulationsQueue.push({ handNumber, move_id, callback });
        this.tasksHandler();
    }

    clearTask(handNumber, move_id) {
        this.activeSimulations = this.activeSimulations.filter(sim => sim.handNumber !== handNumber || sim.move_id !== move_id);
        this.tasksHandler();
    }

    clearIrrelevantTasks(irrelevantHandNumber) {
        this.simulationsQueue = this.simulationsQueue.filter(sim => sim.handNumber !== irrelevantHandNumber);
    }
}

const tasksQueue = new TasksQueue(aggregatorPool);

const handsDict = addon.GetHandsDict();

const allHandsCount = enumPoker.enumPoker.allHandsCount;

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
    console.log('handTxt');
    console.log(handTxt);
    return index > -1 ? index : textHandsArr.indexOf(handTxt.slice(2) + handTxt.slice(0, 2));
};
// console.log(`6h4h: ${getHandIndex('6h4h')}`);       // 258
// console.log(`AhAd: ${getHandIndex('AhAd')}`);       // 0
// console.log('textHandsArr[656]');
// console.log(textHandsArr[656]);

const getNearestSizing = (strategy, cur) => {     // возвращает ближайший АГРО!!-сайзинг к текущему
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

const getMaxAmountBeforeMove = (rawActionList, move) => {
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

const getOptimalSizing = (rawActionList, strategy, amount, move) => {
    const maxAmount = getMaxAmountBeforeMove(rawActionList, move);
    const sizing = amount > maxAmount ? amount - maxAmount : 0;     // превышение над максимальной ставкой
    const example = strategy[Object.keys(strategy)[0]];

    return getNearestSizing(example, sizing);
};

const hillMultiply = (rawActionList, cash, position, move_id) => {
    return rawActionList.reduceRight((hill, move, i) => {
        if (i > 1 && i < move_id && move.position === position) {
            const optimalSizing = move.action < 3 ? getOptimalSizing(rawActionList, cash[i].strategy, move.amount, i) : (move.action === 5 ? -1 : 0);
            const newHill = {};
            Object.keys(hill || cash[i].strategy).forEach(key => {
                newHill[key] = cash[i].strategy[key][optimalSizing].probab * (hill ? hill[key] : 1);
            });
            return newHill;
        }
        return hill;
    }, null);
};

const wasFoldBefore = (position, rawActionList, move) => {
    for (let i = move - 1; i >= 0; i--) {
        if (rawActionList[i].position === position) {
            return rawActionList[i].action === 5;  // fold
        }
    }
    return false;
};

const setHills = (addonSetup, initPlayers, rawActionList, cash, move) => {
    initPlayers.forEach(player => {
        if (!wasFoldBefore(player.enumPosition, rawActionList, move)) {
            addonSetup.setHill(position, hillMultiply(rawActionList, cash, player.enumPosition, move));
        }
    });
};

// mock strategy function
const mockStrategy = (callBack) => {
    const strategy = {                                 // test strategy example
        '1': {
            '0': { probab: 0.0011505433459377008, regret: 20 },
            '100': { probab: 0.0478785282734064, regret: 10 },
            '133': { probab: 0, regret: 40 },
            '200': { probab: 0.000045384682651174424, regret: 35 },
            '300': { probab: 0, regret: 14 },
            '2400': { probab: 0, regret: -40 },
            '-1': { probab: 0.9509255436980047, regret: 10 }
        },
        '2': {
            '0': { probab: 0.0011505433459377008, regret: 20 },
            '100': { probab: 0.0478785282734064, regret: 10 },
            '133': { probab: 0, regret: 40 },
            '200': { probab: 0.000045384682651174424, regret: 35 },
            '300': { probab: 0, regret: 14 },
            '2400': { probab: 0, regret: -40 },
            '-1': { probab: 0.9509255436980047, regret: 10 }
        },
        '3': {
            '0': { probab: 0.0011505433459377008, regret: 20 },
            '100': { probab: 0.0478785282734064, regret: 10 },
            '133': { probab: 0, regret: 40 },
            '200': { probab: 0.000045384682651174424, regret: 35 },
            '300': { probab: 0, regret: 14 },
            '2400': { probab: 0, regret: -40 },
            '-1': { probab: 0.9509255436980047, regret: 10 }
        }
    };
    setTimeout(() => {
        callBack(strategy);
    }, 300);
};
const mockStrategyOne = (callBack) => {
    const strategy = {                                 // test strategy example
        '1': {
            '0': { probab: 0.0511505433459377008, regret: 79 },
            '100': { probab: 0.0008785282734064, regret: 10 },
            '133': { probab: 0, regret: 73 },
            '200': { probab: 0.000045384682651174424, regret: 35 },
            '300': { probab: 0, regret: 14 },
            '2400': { probab: 0.0001, regret: 15 },
            '-1': { probab: 0.9509255436980047, regret: 80 }
        }
    };
    setTimeout(() => {
        callBack(strategy);
    }, 100);
};

// возвращаем стратегию одной руки с сожалениями
const strategyOne = (addonSetup, hand, handTxt, playSetup) => {
    const callCount = enumPoker.enumPoker.perfomancePolicy.oneHandCallRegretCount;
    const regret = {};
    const strategy = {};

    for (let i = 0; i < callCount; i++) {
        console.log(`bom/// hand: ${hand}, handTXT: ${handTxt}, textPath: ${playSetup.txtPath + '\\' + playSetup.txtFile}`);
        const reg = aggregatorSync.random_model_regret(addonSetup, hand);
        console.log('!!!!bom bom');
        console.log(`random regret`);
        console.log(reg);
        let maxKey = 0;

        Object.keys(reg).reduce((max, key) => {
            if (reg[key] > max) {
                maxKey = key;
                return reg[key];
            }
            return max;
        }, -100500);

        strategy[maxKey] = strategy[maxKey] ? (strategy[maxKey] + 1) : 1;
        for (const key in reg) {
            regret[key] = i === 0 ? reg[key] : (regret[key] + reg[key]);
        }
    }

    return Object.keys(regret).reduce((result, key) => Object.assign(result, {
        [key]: {
            strategy: strategy[key] ? (strategy[key]/callCount) : 0,
            regret: regret[key]/callCount,
        }
    }), {});
};

const isCashReady = (rawActionList, cash, move_id) => {
    for (let i = 2; i < move_id; i++) {
        if (!cash[i]) {
            return false;
        }
    }
    return true;
};

const getBoardDealPosition = (street) => {
    switch (street) {
        case 1:
            return enumPoker.enumPoker.dealPositions.DEALPOS_FLOP;
        case 2:
            return enumPoker.enumPoker.dealPositions.DEALPOS_TURN;
        case 3:
            return enumPoker.enumPoker.dealPositions.DEALPOS_RIVER;
    }
};

const getPushBoardCards = (street, board) => {
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

class SimulationsHandler {
    static queueHandler(playSetup, handNumber, callback, simulationArguments) {
        if (playSetup) {
            if (!playSetup.activeSimulations) {
                playSetup.activeSimulations = {};
            }
            if (!playSetup.activeSimulations[handNumber]) {
                playSetup.activeSimulations[handNumber] = {};
                playSetup.activeSimulations[handNumber].lockIndexes = [];    // when some simulation/aggregate starts - we lock same index
            }
            if (simulationArguments.needSimulation || simulationArguments.needCash) {
                playSetup.activeSimulations[handNumber][uniqid()] = { callback, simulationArguments };
            }
        }
    }

    static lockMove(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            playSetup.activeSimulations[handNumber].lockIndexes[move] = true;
        }
    }

    static isMoveLock(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            return playSetup.activeSimulations[handNumber].lockIndexes[move];
        }
        return false;
    }

    static checkCallBacks(playSetup, handNumber, isMockStrategy) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            const isIrrelevant = handNumber !== playSetup.handNumber || playSetup.stopPrompt;
            Object.keys(playSetup.activeSimulations[handNumber]).forEach(key => {
                if (playSetup.activeSimulations[handNumber].hasOwnProperty(key) && key !== 'lockIndexes') {
                    if (isIrrelevant) {
                        playSetup.activeSimulations[handNumber][key].callback();
                    } else {
                        const task = playSetup.activeSimulations[handNumber][key];
                        const {
                            hand,
                            move_id,
                            rawActionList,
                            cash,
                            isNodeSimulation,
                            isHeroTurn,
                            needSimulation,
                        } = task.simulationArguments;

                        if(isCashReady(rawActionList, cash, move_id)) {     // all cash ready before main request move
                            if (isNodeSimulation) {     // start callback with simulation - not main callback!
                                task.callback();
                                delete playSetup.activeSimulations[handNumber][key];
                            } else if (cash[move_id]) {    // main task finished
                                (isHeroTurn && needSimulation) ? task.callback((isMockStrategy ? cash[move_id].strategy[Object.keys(cash[move_id].strategy)[0]] : cash[move_id].strategy[getHandIndex(hand)]), handNumber, move_id, playSetup) : task.callback();
                                delete playSetup.activeSimulations[handNumber][key];
                            }
                        }
                    }
                }
            });

            if (isIrrelevant) {
                delete playSetup.activeSimulations[handNumber];
                tasksQueue.clearIrrelevantTasks(handNumber);
            }

            if (Object.keys(playSetup.activeSimulations).length > 1) {       // if table has irrelevant hand numbers with requests
                Object.keys(playSetup.activeSimulations).filter(handNum => handNum !== playSetup.handNumber).forEach(handNumb => {
                    SimulationsHandler.checkCallBacks(playSetup, handNumb);
                });
            }
        }
    }
}

const nodeSimulation = (rawActionList, isTerminal, move) => {
    if (rawActionList[move]) {
        return rawActionList[move].street >= enumPoker.enumPoker.perfomancePolicy.startSimulationStreet;
    }
    return rawActionList[move - 1].street + (isTerminal ? 1 : 0) >= enumPoker.enumPoker.perfomancePolicy.startSimulationStreet;
};

// test without aggregator !
const isMockStrategy = true;
const isSimulationsOn = false;

const getHill = (request, callback, isOneHand) => {
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
        needCash,
        needSimulation,
        isHeroTurn,
        isTerminal,
        hand,
    } = request;

    if (!isHeroTurn && !needCash) {
        callback ? callback() : '';
        return false;
    }

    if (!isOneHand) {
        const simArguments = {
            hand,
            move_id,
            rawActionList,
            cash,           // []
            needSimulation,
            needCash,
            isHeroTurn,
        };

        SimulationsHandler.queueHandler(playSetup, handNumber, callback, simArguments);
    }

    const movesHandler = (isOneHand) => {
        console.log(`start hand: ${hand} request`);
        if (playSetup.handNumber !== handNumber) {
            SimulationsHandler.checkCallBacks(playSetup, handNumber, isMockStrategy);
            return false;
        }
        const addonSetup = new addon.Setup(BB/100);

        initPlayers.forEach(player => {
            console.log(`set_player(${player.enumPosition}, ${player.initBalance})`);
            addonSetup.set_player(player.enumPosition, player.initBalance);
        });

        for (let move = 0; move <= move_id; move++) {
            if (move < 2) {     // 0, 1 - blinds indexes
                const { position, invest, action } = rawActionList[move];
                console.log(`push_move(${position}, ${invest}, ${action})`);
                addonSetup.push_move(position, invest, action);
            } else {
                if (isOneHand) {
                    if (move === move_id) {
                        // playSetup.handPrompt(strategyOne(addonSetup, getHandIndex(hand), hand, playSetup), handNumber, move_id, playSetup.id);
                        break;
                    }
                } else {
                    if (!SimulationsHandler.isMoveLock(playSetup, handNumber, move)) {
                        // если нету свободных аггрегаторов - добавляем в очередь
                        if (aggregatorPool.isFree()) {
                            const aggregatorKey = aggregatorPool.getFreeKey();
                            const aggregator = aggregatorPool.pool[aggregatorKey].aggregator;
                            SimulationsHandler.lockMove(playSetup, handNumber, move);       // lock move for always

                            const isNodeSimulation = nodeSimulation(rawActionList, isTerminal, move);

                            // callback
                            const getStrategyAsync = (strategy) => {
                                aggregatorPool.unlock(aggregatorKey);       // first
                                tasksQueue.clearTask(handNumber, move);     // second

                                cash[move] = { strategy };

                                SimulationsHandler.checkCallBacks(playSetup, handNumber, isMockStrategy);
                                if (move < move_id) {
                                    movesHandler();
                                }
                            };

                            if (isNodeSimulation) {
                                if (isCashReady(rawActionList, cash, move)) {
                                    if (isMockStrategy) {
                                        mockStrategy(getStrategyAsync);
                                    } else if (isSimulationsOn) {
                                        setHills(addonSetup, initPlayers, rawActionList, cash, move);
                                        aggregator.simulate(addonSetup, getStrategyAsync);
                                    } else {
                                        aggregator.aggregate_all(addonSetup, getStrategyAsync);
                                    }
                                } else {
                                    aggregatorPool.unlock(aggregatorKey);

                                    const simulateCallback = () => {
                                        if (isMockStrategy) {
                                            mockStrategy(getStrategyAsync);
                                        } else if (isSimulationsOn) {
                                            setHills(addonSetup, initPlayers, rawActionList, cash, move);
                                            aggregator.simulate(addonSetup, getStrategyAsync);
                                        } else {
                                            aggregator.aggregate_all(addonSetup, getStrategyAsync);
                                        }
                                    };
                                    const simArguments = {
                                        move_id: move,
                                        rawActionList,
                                        cash,
                                        needSimulation: true,
                                        isNodeSimulation,
                                    };

                                    SimulationsHandler.queueHandler(playSetup, handNumber, simulateCallback, simArguments);
                                }
                                break;      // sync mode
                            } else {                // have an aggregator - doing parallel aggregate
                                if (isMockStrategy) {
                                    mockStrategy(getStrategyAsync);
                                } else {
                                    aggregator.aggregate_all(addonSetup, getStrategyAsync);
                                }
                            }
                        } else {        // no free aggregator
                            tasksQueue.queueHandler(handNumber, move, () => movesHandler(false));
                            break;
                        }
                    } else if (move === move_id || !aggregatorPool.isFree()) {
                        break;
                    }
                }


                // push moves and board
                if (rawActionList[move]) {
                    const { position, invest, action, street } = rawActionList[move];
                    console.log(`push_move(${position}, ${invest}, ${action})`);
                    addonSetup.push_move(position, invest, action);

                    if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street) || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                        console.log(`push board`);
                        addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards((street + 1), board));
                    }
                }
            }
        }
    };
    movesHandler(isOneHand);
};

module.exports.getHill = getHill;