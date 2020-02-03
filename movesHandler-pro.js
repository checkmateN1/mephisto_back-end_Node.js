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

hillMultiply = (hill, strategy, optimalSizing) => {
    let hillNew = {};
    Object.keys(strategy).forEach(key => {
        hillNew[key] = hill[key] * strategy[key][optimalSizing];
    });
    return hillNew;
};

hillMultiplyParallel = (rawActions, hillCash, strategy, optimalSizing) => {
    let hillNew = {};
    Object.keys(strategy).forEach(key => {
        // get hill from all hillCash, using rawAction.position
    });
    return hillNew;
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

// 1) Подключить вызов getHill к очередности задач
// 2) Сделать чтобы возвращалась одна рука при вызове из prompterHandler. И нам не нужно ее переводить в читабельную руку(KhTs) -только для логирования в базу

/// проследить, чтобы в терминальном состоянии вызывать getHill/strategy только когда появится карта борда
const getHill = (handNumber, setup, rawActionList, initPlayers, BB, board, hillsCash, move_id, move_position,
                 isTerminal, isStrategy, isOneHandStrategy, hand, usePerfomancePolicy, callback, onlyPosition) => {    // move_id - для стратегии следующий, для горба текущийы
    let hill = {};
    const addonSetup = new addon.Setup(BB/100);

    initPlayers.forEach(player => {
        addonSetup.set_player(player.enumPosition, player.initBalance);
    });

    const fillCash = (onlyPosition) => {    // опциональный параметр - можно заполнять всем / можно только конкретному игроку
        for (let move = 0; move <= move_id; move++) {
            const { position, invest, amount, action, street } = rawActionList[move];

            if (move < 2) {     // 0, 1 - blinds indexes
                setup.addonSetup.push_move(position, invest, action);
            } else if ((onlyPosition !== undefined && rawActionList[move] && onlyPosition === rawActionList[move].position) || onlyPosition === undefined) {  // fill all or fill only position
                if (!hillsCash[move] || !hillsCash[move].lockMove || !isCashEqual(rawActionList, hillsCash, move)) {
                    const getStrategyAsync = (strategy) => {
                        if (isStrategy && move === move_id) {
                            callback(strategy, handNumber, move_id);
                            if (!isOneHandStrategy) {       // dont cash one hand
                                hillsCash[move] = { strategy };
                            }
                        } else {
                            addonSetup.push_move(position, invest, action);
                            if ((rawActionList[move + 1] && rawActionList[move + 1].street !== street) || (!rawActionList[move + 1] && isTerminal && move < move_id)) {     // street move after push_move
                                addonSetup.push_move(getBoardDealPosition(street + 1), ...getPushBoardCards(street + 1));
                            }

                            const optimalSizing = action < 3 ? getOptimalSizing(rawActionList, strategy, amount, move) : 0;
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
                            hillsCash[move].optimalSizing = action < 3 ? getOptimalSizing(rawActionList, strategy, amount, move) : 0;
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
    fillCash(onlyPosition);
};

module.exports.getHill = getHill;