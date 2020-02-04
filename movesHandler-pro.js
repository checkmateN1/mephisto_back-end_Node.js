const uniqid = require('uniqid');

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

hillMultiply = (rawActions, cash, position) => {
    let hillNew = {};
    Object.keys(strategy).forEach(key => {
        // get hill from all hillCash, using rawAction.position
    });
    return hillNew;
};

// функция которая возвращает труолс - заполнен ли весь кэш по конкретной позиции до конкретного индекса включительно
isCashReady = (rawActions, cash, position, move_id) => {
    for (let i = 2; i <= move_id; i++) {
        if ((rawActions[i] && rawActions[i].poosition === position) || i === move_id) {
            if (!cash[i]) {
                return false;
            }
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

    queueHandler(handNumber, callback, simulationArguments) {
        if (!this.activeSimulations[handNumber]) {
            this.activeSimulations[handNumber] = {};
        }
        this.activeSimulations[handNumber][uniqid()] = { callback, simulationArguments };
    };

    deleteTask(handNumber, taskID) {
        if (this.activeSimulations[handNumber]) {
            delete this.activeSimulations[handNumber][taskID];
            if (!Object.keys(this.activeSimulations[handNumber]).length) {
                delete this.activeSimulations[handNumber];
            }
        }
    }

    checkCallBacks(handNumber, newHandNumber) {
        if (handNumber !== newHandNumber) {
            delete this.activeSimulations[handNumber];
        } else if (Object.keys(this.activeSimulations[handNumber]).length) {
            Object.keys(this.activeSimulations[handNumber]).forEach(key => {
                const {
                    move_id,
                    playSetup,
                    rawActions,
                    cash,
                    move_position,
                    isStrategy,
                    isOneHandStrategy,
                } = this.activeSimulations[handNumber][key].simulationArguments;

                if (isStrategy && cash[move_id]) {      // need to have all hills for all players
                    callback(cash[move_id], handNumber, move_id, playSetup);
                }
                if(isCashReady(rawActions, cash, move_position, move_id)) {
                    if (!isStrategy) {
                        callback(hillMultiply(rawActions, cash, move_position), handNumber, move_id, playSetup);
                    }
                    callback(strategy, handNumber, move_id, playSetup);
                    this.deleteTask(handNumber, key);
                }
            });
        }
    }
}

const simulationsQueue = new SimulationsQueue();

// 2) Сделать чтобы возвращалась одна рука при вызове из prompterHandler. И нам не нужно ее переводить в читабельную руку(KhTs) -только для логирования в базу
// 3) Не забываем проверять что новый номер руки !== старый

const perfomancePolicy = Object.freeze({
    oneHandStrategyStreet: 1,
    prepareCashStrategyStreet: 1,
    simulationsStreet: [2, 3],
});

const needCash = (isStrategy, rawActionList) => {
    return rawActionList[rawActionList.length - 1].street >= perfomancePolicy.prepareCashStrategyStree;
};
const isOneHandStrategy = (isStrategy, rawActionList) => {
    return rawActionList[rawActionList.length - 1].street <= perfomancePolicy.oneHandStrategyStreet;
};

/// проследить, чтобы в терминальном состоянии вызывать getHill/strategy только когда появится карта борда
const getHill = (request, callback) => {    // move_id - для стратегии следующий, для горба текущийы
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
        isTerminal,
        isStrategy,
        hand,
    } = request;

    const isOneHandStrategy = isOneHandStrategy(isStrategy, rawActionList);
    if (!isOneHandStrategy) {
        const simArguments = {
            move_id,
            playSetup,
            rawActions,
            cash,
            move_position,
            isStrategy,
            isOneHandStrategy,
        };

        simulationsQueue.queueHandler(handNumber, callback, simArguments);
    }

    const addonSetup = new addon.Setup(BB/100);

    initPlayers.forEach(player => {
        addonSetup.set_player(player.enumPosition, player.initBalance);
    });

    const fillCash = () => {    // опциональный параметр - можно заполнять всем / можно только конкретному игроку
        for (let move = 0; move <= move_id; move++) {
            const { position, invest, amount, action, street } = rawActionList[move];

            if (move < 2) {     // 0, 1 - blinds indexes
                addonSetup.push_move(position, invest, action);
            } else {
                if (!cash[move]) {
                    if (needCash(isStrategy, rawActionList)) {
                        const getStrategyAsync = (strategy) => {
                            cash[move] = { strategy };
                            if (rawActionList[move]) {
                                cash[move].optimalSizing = action < 3 ? getOptimalSizing(rawActionList, strategy, amount, move) : 0;
                            }

                            simulationsQueue.checkCallBacks(handNumber, playSetup.handNumber);
                        };
                        aggregator.aggregate_all(addonSetup, getStrategyAsync);
                    }

                    if (move === move_id && isOneHandStrategy) {
                        const getOneStrategyAsync = (strategy) => {
                            callback(strategy[Object.keys(strategy)[0]], handNumber, move_id, playSetup);
                        };
                        aggregator.aggregate_one(addonSetup, getOneStrategyAsync, getHandIndex(hand), 'cpu');
                    }

                } else {
                    if (move === move_id) {
                        if (isOneHandStrategy) {
                            const strategy = cash[move].strategy[getHandIndex(hand)];
                            callback(strategy, handNumber, move_id, playSetup);
                        } else {
                            simulationsQueue.checkCallBacks(handNumber, playSetup.handNumber);
                        }
                    } else {
                        if (cash[move].optimalSizing === undefined) {       // cash: { strategy }
                            cash[move].optimalSizing = action < 3 ? getOptimalSizing(rawActionList, strategy, amount, move) : 0;
                        }
                    }
                }

                if (rawActionList[move]) {
                    addonSetup.push_move(position, invest, action);
                }
                if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street)
                    || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                    addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards(street + 1), board);
                }
            }
        }
    };
    fillCash();
};

module.exports.getHill = getHill;