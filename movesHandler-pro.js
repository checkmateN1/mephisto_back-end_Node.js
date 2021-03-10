const _ = require('lodash');
const moment = require('moment');

const enumPoker = require('./enum');
const playUtils = require('./playLogic/play_utils');
const addonUtils = require('./playLogic/addonUtils');

const diskDrive = enumPoker.enumPoker.perfomancePolicy.projectDrive;  // laptop
// addon.SetDefaultDevice('cpu');

if (!enumPoker.enumPoker.perfomancePolicy.isSimulatorOnly) {
  // addon.DeserializeBucketingType(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 0);
  // addon.DeserializeBucketingType(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 4);
}

// addon.DeserializeBucketingType('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\', 0);
// modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RA');
// modelsPoolSync = new addon.ModelsPool(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model`, 'trained_RS');
// aggregator = new addon.RegretPoolToStrategyAggregator( modelsPool );
// aggregatorSync = new addon.RegretPoolToStrategyAggregator( modelsPoolSync );

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


// mock strategy function
const mockStrategy = (callBack) => {
    const strategy = {                                 // test strategy example
        '1': {
            '0': { strategy: 0.0011505433459377008, regret: 20 },
            '100': { strategy: 0.0478785282734064, regret: 10 },
            '133': { strategy: 0, regret: 40 },
            '200': { strategy: 0.000045384682651174424, regret: 35 },
            '300': { strategy: 0, regret: 14 },
            '2400': { strategy: 0, regret: -40 },
            '-1': { strategy: 0.9509255436980047, regret: 10 }
        },
        '2': {
            '0': { strategy: 0.0011505433459377008, regret: 20 },
            '100': { strategy: 0.0478785282734064, regret: 10 },
            '133': { strategy: 0, regret: 40 },
            '200': { strategy: 0.000045384682651174424, regret: 35 },
            '300': { strategy: 0, regret: 14 },
            '2400': { strategy: 0, regret: -40 },
            '-1': { strategy: 0.9509255436980047, regret: 10 }
        },
        '3': {
            '0': { strategy: 0.0011505433459377008, regret: 20 },
            '100': { strategy: 0.0478785282734064, regret: 10 },
            '133': { strategy: 0, regret: 40 },
            '200': { strategy: 0.000045384682651174424, regret: 35 },
            '300': { strategy: 0, regret: 14 },
            '2400': { strategy: 0, regret: -40 },
            '-1': { strategy: 0.9509255436980047, regret: 10 }
        }
    };
    setTimeout(() => {
        callBack(strategy);
    }, 300);
};

// const modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RS');
// const aggregator = new addon.RegretPoolToStrategyAggregator( modelsPool );

// class AggregatorPool {
//     constructor() {
//         this.pool = {};
//         Array(enumPoker.enumPoker.perfomancePolicy.maxActiveAggregate).fill().forEach((cur, index) => {
//             const modelsPool = new addon.ModelsPool('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\regret_model', 'trained_RS');
//
//             this.pool[index] = {
//                 modelsPool,
//                 aggregator: new addon.RegretPoolToStrategyAggregator( modelsPool ),
//                 isLock: false,
//             }
//         });
//     }
//
//     isFree() {
//         for (const key in this.pool) {
//             if (!this.pool[key].isLock) {
//                 return true;
//             }
//             return false;
//         }
//     }
//
//     getFreeKey() {
//         for (const key in this.pool) {
//             if (!this.pool[key].isLock) {
//                 this.pool[key].isLock = true;
//                 return key;
//             }
//         }
//     }
//
//     unlock(key) {
//         this.pool[key].isLock = false;
//     }
// }

// const aggregatorPool = new AggregatorPool();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class SimulatePool {
    constructor() {
        this.pool = {};
        Array(enumPoker.enumPoker.perfomancePolicy.maxActiveSimulations).fill().forEach((cur, index) => {

            this.pool[index] = {
                // simulator: addonUtils.getSimSessionForFeatureWithoutHeroHand(),
                isLock: false,
            }
        });
    }

    isFree() {
        for (const key in this.pool) {
            if (!this.pool[key].isLock) {
                return true;
            }
            return false;
        }
    }

    getFreeKey() {
        for (const key in this.pool) {
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

const simulatorPool = new SimulatePool();


/////////////////////////////////////////////////////////////////////////////////////////////////////

class TasksQueue {
    constructor(simulatorPool) {
        this.simulationsQueue = [];
        this.simulatorPool = simulatorPool;
    }

    tasksHandler() {
        if (this.simulatorPool.isFree()) {
            const importantTask = this.simulationsQueue.filter(task => task.isImportant).shift();
            if (importantTask) {
                importantTask.callback();
            } else {
                const task = this.simulationsQueue.shift();
                if (task) {
                    task.callback();
                }
            }
        }
    }

    queueHandler(handNumber, callback, isImportant) {
        this.simulationsQueue.push({ handNumber, callback, isImportant });
        this.tasksHandler();
    }

    clearIrrelevantTasks(irrelevantHandNumber) {
        this.simulationsQueue = this.simulationsQueue.filter(sim => sim.handNumber !== irrelevantHandNumber);
    }
}

const tasksQueue = new TasksQueue(simulatorPool);

const handsDict = addonUtils.getHandsDict();

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

const mockStrategyOne = (callBack) => {
    const strategy = {                                 // test strategy example
        '1': {
            '0': { strategy: 0.0511505433459377008, regret: 79 },
            '100': { strategy: 0.0008785282734064, regret: 10 },
            '133': { strategy: 0, regret: 73 },
            '200': { strategy: 0.000045384682651174424, regret: 35 },
            '300': { strategy: 0, regret: 14 },
            '2400': { strategy: 0.0001, regret: 15 },
            '-1': { strategy: 0.9509255436980047, regret: 80 }
        }
    };
    setTimeout(() => {
        callBack(strategy);
    }, 0);
};

const strategyOne = (addonSetup, hand, handTxt, playSetup) => {
    const callCount = enumPoker.enumPoker.perfomancePolicy.oneHandCallRegretCount;
    const regret = {};
    const strategy = {};

    for (let i = 0; i < callCount; i++) {
        console.log(`bom/// hand: ${hand}, handTXT: ${handTxt}, textPath: ${playSetup.txtPath + '\\' + playSetup.txtFile}`);
        // const reg = aggregatorSync.random_model_regret(addonSetup, hand);
        const reg = [];
        console.log(`one hand prompt`);
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

class SimulationsHandler {
    static queueHandler(playSetup, handNumber, callback, simulationArguments) {
        if (playSetup) {
            if (!playSetup.activeSimulations) {
                playSetup.activeSimulations = {};
            }
            if (!playSetup.activeSimulations[handNumber]) {
                playSetup.activeSimulations[handNumber] = {};
                playSetup.activeSimulations[handNumber].resimulStreetsCount = [0, 0, 0, 0]; // preflop, flop, turn, river
                playSetup.activeSimulations[handNumber].lockIndexes = [];    // when some simulation/aggregate starts - we lock same index
            }
            if (simulationArguments.needSimulation || simulationArguments.needCash) { // !!! ревизия - только один мув добавили а не все мувы до этого
                playSetup.activeSimulations[handNumber][simulationArguments.move_id] = { callback, simulationArguments };
            }
        }
    }

    static lockMove(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            playSetup.activeSimulations[handNumber].lockIndexes[move] = true;
            // !!! пишем
        }
    }

    static getResimulStreetCount(playSetup, handNumber, streetNumber) {
        if (playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            if (playSetup.activeSimulations[handNumber].resimulStreetsCount) {
                return playSetup.activeSimulations[handNumber].resimulStreetsCount[streetNumber];
            } else {
                playSetup.activeSimulations[handNumber].resimulStreetsCount = [0, 0, 0, 0];
                return 0;
            }
        } else {
            throw new Error(`Wrong playSetup.activeSimulations[handNumber] state!`);
        }
    }

    static incrementResimulStreetCount(playSetup, handNumber, streetNumber) {
        if (playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            if (playSetup.activeSimulations[handNumber].resimulStreetsCount) {
                playSetup.activeSimulations[handNumber].resimulStreetsCount[streetNumber] += 1;
                console.log('test');
            } else {
                playSetup.activeSimulations[handNumber].resimulStreetsCount = [0, 0, 0, 0];
                playSetup.activeSimulations[handNumber].resimulStreetsCount[streetNumber] += 1;
            }
        } else {
            throw new Error('Wrong playSetup.activeSimulations[handNumber] state!');
        }
    }

    static unlockMove(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            playSetup.activeSimulations[handNumber].lockIndexes[move] = false;
        }
    }

    static isMoveLock(playSetup, handNumber, move) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            return playSetup.activeSimulations[handNumber].lockIndexes[move];
        }
        return false;
    }

    //
    static checkCallBacks(playSetup, handNumber, isMockStrategy) {
        if (playSetup && playSetup.activeSimulations && playSetup.activeSimulations[handNumber]) {
            const isIrrelevant = handNumber !== playSetup.handNumber || playSetup.stopPrompt;
            Object.keys(playSetup.activeSimulations[handNumber]).sort((a, b) => +a - +b).forEach(key => {
                if (key !== 'lockIndexes' && playSetup.activeSimulations[handNumber].hasOwnProperty(key)) {
                    if (isIrrelevant) {
                        playSetup.activeSimulations[handNumber][key].callback();
                    } else {
                        const task = playSetup.activeSimulations[handNumber][key];
                        const {
                            hand,
                            move_id,
                            rawActionList,
                            cash,
                            isHeroTurn,
                            needSimulation,
                        } = task.simulationArguments;

                        if(isCashReady(rawActionList, cash, move_id) && cash[move_id]) {     // all cash ready before main request move
                            const strategy = isMockStrategy ? cash[move_id].strategy[Object.keys(cash[move_id].strategy)[0]] : cash[move_id].strategy[getHandIndex(hand)];
                            (isHeroTurn && needSimulation) ? task.callback(strategy, handNumber, move_id, playSetup) : task.callback();
                            delete playSetup.activeSimulations[handNumber][key];
                            tasksQueue.tasksHandler();
                        }
                    }
                }
            });

            if (isIrrelevant) {
                delete playSetup.activeSimulations[handNumber];
                tasksQueue.clearIrrelevantTasks(handNumber);
                tasksQueue.tasksHandler();
            }

            if (Object.keys(playSetup.activeSimulations).length > 1) {       // if table has irrelevant hand numbers with requests
                Object.keys(playSetup.activeSimulations).filter(handNum => handNum !== playSetup.handNumber).forEach(handNumb => {
                    SimulationsHandler.checkCallBacks(playSetup, handNumb, isMockStrategy);
                });
            }
        }
    }
}

const debugEmmit = (playSetup, hand, aggregatorLock, move) => {
    if (playSetup.client) {
        playSetup.client.emit('debugInfo', {
            id: playSetup.id,
            hand,
            aggregatorLock,
            move,
            aggregatorFree: simulatorPool.isFree(),
            sessionsQueue: playSetup.sessionSetup.tasksQueue.tasksQueue.length,
            tasksSimulationsQueue: tasksQueue.simulationsQueue.length,
        });
    }
};

function movesDebugInfo(client, move) {
// <tr>
//     <td>{move}</td>
//     <td>{moves[move].street}</td>
//     <td>{moves[move].action}</td>
//     <td>{moves[move].invest}</td>
//     <td>{moves[move].isLock}</td>
//     <td>{moves[move].lockTime}</td>
//     <td>{moves[move].fillCashTime}</td>
//     <td>{moves[move].wasUnlock}</td>
//     <td>{moves[move].unlockTime}</td>
//     <td>{moves[move].clearCashTime}</td>
//     <td>{moves[move].lockAgainTime}</td>
//     <td>{moves[move].fillAgainCashTime}</td>
// </tr>

    client.emit(enumPoker.enumCommon.DEBUG_MOVES_TABLE, move);
}

const isMockStrategy = false;
const isSimulationsOn = true;
const isDebugMode = enumPoker.enumPoker.perfomancePolicy.debugMode;

const getHill = (request, callback, isOneHand) => {
    const {
        handNumber,
        playSetup,
        rawActionList,
        initPlayers,
        BB,
        board,
        cash,
        move_id,    // !!! БУДУЩИЙ ход, которого еще нету в rawActions
        move_position,
        needCash,
        isTerminal,
        needSimulation,
        isHeroTurn,
        hand,
        positionEnumKeyMap,
    } = request;

    if (!isHeroTurn && !needCash) {
        callback ? callback() : '';
        return false;
    }

    if (!isOneHand) {
        const options = {
            hand,
            move_id,        // !!! БУДУЩИЙ ход, которого еще нету в rawActions
            rawActionList,
            cash,           // []
            needSimulation,
            needCash,
            isHeroTurn,
        };

        // проверить что каждый индекс мува у конкретной руки до move_id залочен.
        // записывать в лок инфу каждого мува руки количество пересимуляций этой улицы
        SimulationsHandler.queueHandler(playSetup, handNumber, callback, options);

        // debug
        if (isDebugMode) {
            const data = {
                isNeedCash: true,
            };

            playSetup.client.emit(enumPoker.enumCommon.DEBUG_MOVES_HANDLER, data);
        }
    }

    const movesHandler = (isOneHand) => {
        const isIrrelevant = handNumber !== playSetup.handNumber || playSetup.stopPrompt;
        if (isIrrelevant) {
            callback();
            tasksQueue.clearIrrelevantTasks(handNumber);
            SimulationsHandler.checkCallBacks(playSetup, handNumber, isMockStrategy);
            return false;
        }

        console.log(`start hand: ${hand} request`);

        const simSession = addonUtils.getSimSessionForFeatureWithoutHeroHand();
        const addonSetup = addonUtils.getSetup(BB/100);

        initPlayers.forEach(player => {
            console.log(`set_player(${player.enumPosition}, ${player.initBalance})`);
            addonSetup.set_player(player.enumPosition, player.initBalance);
        });

        for (let move = 0; move <= move_id; move++) {           // проверить когда move === move_id - не существующий мув в rawActions
            // !!!!!!!!!!!! debug
            if (isDebugMode) {
                // <tr>
                //     <td>{move}</td>
                //     <td>{moves[move].street}</td>
                //     <td>{moves[move].action}</td>
                //     <td>{moves[move].invest}</td>
                //     <td>{moves[move].isLock}</td>
                //     <td>{moves[move].lockTime}</td>
                //     <td>{moves[move].fillCashTime}</td>
                //     <td>{moves[move].wasUnlock}</td>
                //     <td>{moves[move].unlockTime}</td>
                //     <td>{moves[move].clearCashTime}</td>
                //     <td>{moves[move].lockAgainTime}</td>
                //     <td>{moves[move].fillAgainCashTime}</td>
                // </tr>

                const rawActionsSlice = rawActionList.slice();
                if (rawActionsSlice[move]) {
                    rawActionsSlice.length = move + 1;

                    const data = {
                        handNumber,
                        move_id: move,
                        street: rawActionsSlice[move].street,
                        action: enumPoker.enumPoker.actionsType[rawActionsSlice[move].action],
                        invest: rawActionsSlice[move].invest,
                    };

                    movesDebugInfo(playSetup.client, data);
                }
            }
            // !!!!!!!!!!!!! debug

            let isTerminalCalc = false;

            if (move > 2) {
                if ((rawActionList[move + 1] && rawActionList[move + 1].street !== rawActionList[move].street)) {
                    isTerminalCalc = true;
                } else if (!rawActionList[move + 1]) {
                    isTerminalCalc = isTerminal;
                }
            }

            // на какой улице совершен данный мув(move) c учетом ВСЕГО что только может быть(терминального и не существующего тоже)
            const curStreetMove = playUtils.getCurStreet(rawActionList, move, initPlayers, positionEnumKeyMap, isTerminalCalc);

            if (move < 2) {     // 0, 1 - blinds indexes
                const { position, invest, action } = rawActionList[move];
                console.log(`push_move(${position}, ${invest}, ${action})`);
                addonSetup.push_move(position, invest, action);
            } else if (move === move_id && !needSimulation) {
                // do nothing
            } else {
                if (isOneHand) {
                    if (move === move_id) {
                        playSetup.handPrompt(strategyOne(addonSetup, getHandIndex(hand), hand, playSetup), handNumber, move_id, playSetup.id);
                        break;
                    }
                } else {
                    const isSimulationNode = playUtils.nodeSimulation(playSetup, rawActionList, move, initPlayers, positionEnumKeyMap, isDebugMode, curStreetMove);

                    if (!SimulationsHandler.isMoveLock(playSetup, handNumber, move)) {
                        // если агрегате олл - все равно коллбек нужен - его пилим первым
                        // если симулате - проверяем кэш, затем свободность симулятора
                        // если пилить с ограничением агрегате, то мы используем 2 пулла и один менеджер задач общий
                        // 1) делаем ревизию менеджера задач общий для 2х пулов. Продебажить и проверить что в вызове movesHandler все ок с замыканием
                        // 2) делаем общий колбек
                        // 3) разделяем

                        let simulatorKey;

                        if (isSimulationNode) {
                            simulatorKey = simulatorPool.getFreeKey();
                        }

                        // создаем для замыкания данные по поводу количества пересимуляций на улице текущего мува
                        // определить улицу мува, который мы будем симулевать

                        // callback
                        const getStrategyAsync = (strategy) => {
                            // !!!!!!!!!!!! debug
                            if (isDebugMode) {
                                debugEmmit(playSetup, '', false, '');

                                const data = {
                                    handNumber,
                                    move_id: move,
                                };

                                if (cash[move]) {
                                    data.fillAgainCashTime = moment().format('mm:ss.SSS');
                                } else {
                                    data.fillCashTime = moment().format('mm:ss.SSS');
                                }

                                movesDebugInfo(playSetup.client, data);
                            }
                            // !!!!!!!!!!!!! debug

                            // проверяем что количество пересимуляций по улице совпадает с текущим(которое уже могло инкрементироваться)
                            if (curStreetMove === SimulationsHandler.getResimulStreetCount(playSetup, handNumber, curStreetMove)) {
                                // не было запроса на пересимуляцию с момента постановки задачи

                            }
                            cash[move] = { strategy };

                            SimulationsHandler.checkCallBacks(playSetup, handNumber, isMockStrategy);
                            if (simulatorKey !== undefined) {
                                simulatorPool.unlock(simulatorKey);       // first
                            }
                            tasksQueue.tasksHandler();                  // second

                            if (move < move_id) {               // !!!! а нужно ли запускать вообще с учетом запуска tasksQueue.tasksHandler();
                                movesHandler();
                            }
                        };

                        if (isSimulationNode) {
                            if (simulatorKey !== undefined && isCashReady(rawActionList, cash, move)) {       // have free simulator cpu and will do sync mode simulations
                                SimulationsHandler.lockMove(playSetup, handNumber, move);       // lock move for always !!! если не будет нестанд сайзинга !!!

                                // !!!!!!!!!!!! debug
                                if (isDebugMode) {
                                    const data = {
                                        handNumber,
                                        move_id: move,
                                        isLock: true,
                                        lockTime: moment().format('mm:ss.SSS')
                                    };

                                    movesDebugInfo(playSetup.client, data);
                                    debugEmmit(playSetup, hand, true, move);
                                }
                                // !!!!!!!!!!!!! debug

                                if (isMockStrategy) {
                                    mockStrategy(getStrategyAsync);
                                } else if (isSimulationsOn) {
                                    setHills(addonSetup, initPlayers, rawActionList, cash, move);          // !!! WAITING API
                                    simSession.start_simulate(addonSetup, {}, 0, 0, getStrategyAsync);                     // !!! WAITING API
                                } else {
                                    console.log(`!!!!!!!////// //// //// inside nodeSimulation /// isCashReady /// move = ${move}`);
                                    simSession.start_simulate(addonSetup, {}, 0, 0, getStrategyAsync);
                                }
                            } else {
                                simulatorPool.unlock(simulatorKey);

                                // debug mode
                                if (isDebugMode) {
                                    debugEmmit(playSetup, '', false, '');
                                }

                                tasksQueue.queueHandler(handNumber, () => { movesHandler() }, false);
                            }
                            break;

                        } else {         // have an aggregator - doing parallel cash aggregate
                            // debug mode
                            if (isDebugMode) {
                                debugEmmit(playSetup, hand, true, move);
                            }

                            SimulationsHandler.lockMove(playSetup, handNumber, move);       // lock move for always but not for resimulations after odd sizing
                            if (isMockStrategy) {
                                mockStrategy(getStrategyAsync);
                            } else {
                                simSession.start_simulate(addonSetup, {}, 0, 0, getStrategyAsync);
                            }
                        }

                    } else if (move === move_id) {      // move is lock
                        break;
                    }
                }

                // push moves and board
                if (rawActionList[move]) {
                    addonUtils.pushMove(addonSetup, rawActionList, move, isTerminalCalc, board);

                    // const { position, invest, action, street } = rawActionList[move];
                    // console.log(`push_move(${position}, ${invest}, ${action})`);
                    // addonSetup.push_move(position, invest, action);
                    //
                    // if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street) || (!rawActionList[move + 1] && isTerminalCalc && move < move_id)) {     // street move after push_move
                    //     console.log(`push board`);
                    //     addonSetup.push_move(playUtils.getBoardDealPosition(street + 1), ...playUtils.getPushBoardCards((street + 1), board));
                    // }
                }
            }
        }
    };
    movesHandler(isOneHand);
};

module.exports.getHill = getHill;