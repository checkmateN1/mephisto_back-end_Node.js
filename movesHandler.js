// const PokerEngine = require('./pokerEngine');  // molotok
// const middleware = require('./engineMiddleware_work');   // molotok
const enumPoker = require('./enum');
const utils = require('./utils');
const playUtils = require('./playLogic/play_utils');
const addonUtils = require('./playLogic/addonUtils');

const _ = require('lodash');
const fs = require('fs');
const adapt_size = 10;
const diskDrive = enumPoker.enumPoker.perfomancePolicy.projectDrive;
// const diskDrive = 'D';  // mephisto

const isOfflineStrategy = false;

const handsDict = addonUtils.getHandsDict();

let currentGeneration = 'all';
let generationsNames = [];

const changeAddonPath = (generation) => {
    const newModelsPoolPath = diskDrive + modelsAllPath + ((generation === 'all') ? '' : `\\single_copies\\${generation}`);
    console.log('newModelsPoolPath', newModelsPoolPath);

    modelsPool = new addon.ModelsPool(newModelsPoolPath, trainedPrefix);
    aggregator = new addon.RegretPoolToStrategyAggregator( modelsPool );

    currentGeneration = generation;
};

const copySingleGenerations = () => {
    const folders = fs.readdirSync((diskDrive + modelsAllPath));
    // console.log('folders');   // ['trained_RS1', 'trained_RS2', etc, 'single_copies']
    // console.log(folders);

    folders.forEach(folder => {
        if (folder !== 'single_copies' && folder !== 'bk') {
            const newFolderName = folder.replace(trainedPrefix, '');    // 1, 2, 3, etc
            const folderPath = diskDrive + modelsAllPath + `\\single_copies\\${newFolderName}`;
            try {
                if (!fs.existsSync(folderPath)){
                    fs.mkdirSync(folderPath);
                    fs.mkdirSync(folderPath + `\\${trainedPrefix}1`);

                    // copy files
                    // read files list in source folder
                    const files = fs.readdirSync((diskDrive + modelsAllPath + `\\${folder}`));

                    // copy
                    files.forEach(file => {
                        fs.copyFileSync((diskDrive + modelsAllPath + `\\${folder}\\${file}`), (folderPath + `\\${trainedPrefix}1\\${file}`));
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }
    });

    // copy all files success
    generationsNames = fs.readdirSync((diskDrive + modelsAllPath + `\\single_copies`))
      .filter(folder => !isNaN(folder))
      .sort((a, b) => +a - +b);
};
console.log('start copySingleGenerations');
// copySingleGenerations();
// console.log('generationsNames', generationsNames);


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

// console.log('2sAc index');
// console.log(`2sAc: ${getHandIndex('2sAc')}`);       //  737
// console.log(`AhAd: ${getHandIndex('AhAd')}`);       // 0

// console.log('textHandsArr[734]');
// console.log(textHandsArr[734]);

getSizing = (strategy, cur) => {     // возвращает ближайший сайзинг к текущему
    let closedSizing = 100500;
    Object.keys(strategy).reduce((min, current) => {
        const diff = Math.abs(parseInt(cur) - parseInt(current));
        if (diff < min) {
            closedSizing = parseInt(current);
            return diff;
        } else {
            return min;
        }
    }, 100500);

    return closedSizing;
};

getMaxAmount = (arr, maxIndex) => arr.reduce((max, cur, i) => (i <= maxIndex && cur.amount > max) ? cur.amount : max, 0);


getHill = async (position, curInvest, movesCount, setup, isNodeSimulation, simSession) => {
    // console.log(`start getHill! MovesCount: ${movesCount}, movesInEngine: ${setup.movesInEngine}`);
    let strategy = null;

    //
    if (isOfflineStrategy) {
        let tmp;
        try {
            tmp = strategyObject.get_strategy(setup.addonSetup);
        } catch (e) {
            // console.log('e', e);
            console.log('e.message', e.message);
            // console.log('e.messageerror', e.messageerror);
            utils.errorsHandler(e.message);
            return null;
        }

        strategy = {};
        for (let key in tmp) {
            strategy[key] =  {};
            for (let innerKey in tmp[key]) {
                strategy[key][innerKey] = { strategy:  tmp[key][innerKey], regret: 0 }
            }
        }
        // console.log('strategyObject from offline!!!');
        // console.log(strategy);
    } else {
      // чтобы получить стратегию после симуляций, нужно ввести перемноженные веса рук из setup.hillsCash[movesCount]
        try {
            if (isNodeSimulation) {
              strategy = await addonUtils.getStrategyAsync(true, setup.addonSetup, simSession, {}, 0, 0);
            } else {
              strategy = await addonUtils.getStrategyAsync(false, setup.addonSetup);
            }
        } catch (e) {
            console.log(e);
            utils.errorsHandler(e);
            return null;
        }
        // console.log('strategyObject from online!!!');
        // console.log(strategy);
    }
    console.log(`get strategy success!`);
    console.log(strategy);


    // console.log('strategy[1325]');
    // console.log(strategy[1325]);

    // new strategy
    // '1325': {
    //     '0': { strategy: 0.033762784413862316, regret: -16.843776710828145 },
    //     '305': { strategy: 0.17991322669270343, regret: 91.02318106179203 },
    //     '450': { strategy: 0.2281473734378813, regret: 83.27340037027994 },
    //     '675': { strategy: 0.01580099600391464, regret: -128.2929660320282 },
    //     '1080': { strategy: 0, regret: -427.39461053212483 },
    //     '2050': { strategy: 0.10904228611830498, regret: -7.733266099294027 },
    //     '-1': { strategy: 0.43333333333333335, regret: 30.33111974784794 }
    // }

    // strategy = Object.keys(strategy).map(hand => {
    //
    // });

    // if (movesCount === 3) {
    // console.log(`node bet 2BB with 6h4h`);
    // if (position === 0) {
    //     console.log(`Got strategy, move: ${movesCount}, strategy[333]:`);
    //     console.log(strategy[333]);
    // }

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
            weight = (index !== -1 && index > 1) ? setup.hillsCash[index].cash[i].weight * setup.hillsCash[index].cash[i].strategy[setup.hillsCash[index].cash[i].optimalSizing].strategy : 1;
            strat = strategy[i];
            // if (i === 0) {      // 258 - 64, 0 - AA
            //     console.log(`prev AA weight: ${weight}`);
            // }
            if (i === 1325) {      // 1325 - 72, 258 - 64, 0 - AA
                console.log(`72 weight: ${weight}`);
                console.log(strat);
            }
        }
        return { hand, weight, strategy: strat, optimalSizing };
    });
};

//
getAllHandStrategy = (cash, position, setup) => {            // cash = [{ hand, weight, strategy, optimalSizing, isPreflop }, .....]

    // console.log('setup.movesCash');
    // console.log(setup.movesCash);


    const preflopCash = position !== undefined ? setup.hillsCash.reduceRight((cash, cur) => {
        // console.log(`position: ${position}, cur.position: ${cur.position}, cur.isPreflop: ${cur.isPreflop}`);
        if (!cash && position === cur.position && cur.isPreflop) {
            return cur.cash;
        }
        return cash;
    }, undefined) : null;
    // console.log('preflopCash');
    // console.log(preflopCash);

    // console.log('preflopCash[0].strategy[preflopCash[0].optimalSizing]');
    // console.log(preflopCash ? preflopCash[0].strategy[preflopCash[0].optimalSizing] : null);
    //
    // console.log('preflopCash[0].strategy[preflopCash[0].optimalSizing].strategy');
    // console.log(preflopCash ? preflopCash[0].strategy[preflopCash[0].optimalSizing].strategy: null);
    //
    // console.log('!!preflopCash');
    // console.log(!!preflopCash);


    const allHandsStrategy = {     // simulator format
        allHands: cash.map((obj, i) => {     // { hand, weight, strategy, optimalSizing, isPreflop }
            const {
                hand,
                weight,
                strategy,
            } = obj;
            const strat = {};

            if (Object.keys(strategy).length) {
                Object.keys(strategy).forEach(key => {
                    strat[key == -1 ? -1 : parseInt(key)/100] = {
                        strategy: strategy[key].strategy,
                        ev: (strategy[key].ev/100).toFixed(2),
                    };
                })
            }

            return {
                hand,
                weight,
                preflopWeight: preflopCash ? preflopCash[i].weight * preflopCash[i].strategy[preflopCash[i].optimalSizing].strategy : 1,
                moves: strat,
            };
        })
    };

    // console.log('allHandsStrategy');
    // console.log(allHandsStrategy);

    // normalize
    let maxWeight = 0;
    let maxPreflopWeight = 0;
    allHandsStrategy.allHands.forEach( hand => {
        if (hand.weight > maxWeight) {
            maxWeight = hand.weight;
        }
        if (hand.preflopWeight > maxPreflopWeight) {
            maxPreflopWeight = hand.preflopWeight;
        }
    });

    allHandsStrategy.allHands = allHandsStrategy.allHands.map( hand => {
        return Object.assign(hand, {
            weight: hand.weight/maxWeight || 0,
            preflopWeight: hand.preflopWeight/maxPreflopWeight
        });
    }).filter(el => el.weight >= 0);

    // console.log('allHandsStrategy');
    // console.log(allHandsStrategy.allHands);

    return  allHandsStrategy;
};

isInitPlayersEqual = (request, setup) => {
    if (request.players.length !== setup.movesCash.players.length) {
        return false;
    }
    for (let i = 0; i < request.players.length; i++) {
        const nickname = request.players[i].name;
        const stack = parseInt(request.players[i].stack * 100);
        const position = request.players[i].position;

        const checkCashPlayer = {
            nickname,
            stack,
            position,
        };

        if (!_.isEqual(checkCashPlayer, setup.movesCash.players[i])) {
            return false;
        }
    }
    return true;
};

popMoves = (nMove, setup) => {
    setup.hillsCash.length = nMove;

    // console.log(`popMoves... nMove: ${nMove}, setup.movesInEngine: ${setup.movesInEngine}`);
    while(setup.movesInEngine > nMove && setup.movesInEngine > 0) {
        setup.addonSetup.pop_move();
        setup.movesInEngine--;
    }
};

const isNodeSimulation = (street, moveAtStreet) => {
    if (street > enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
        return true;
    } else if (street === enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
        return moveAtStreet >= enumPoker.enumPoker.perfomancePolicy.startMoveSimulation;
    }

    return false;
};

const movesHandler = async (request, bbSize, setup, nodeId) => {      // nodeId - начиная с нуля... первый ход префлопа после постов - nodeId === 2. Пуш борд не считаем
    console.log(`enter moves handler!!`);
    const simSession = addonUtils.getSimSessionForFeatureWithoutHeroHand();
    let isCashSteelUseful = true;
    let movesCount = 0;

    const { rawActionList } = request;

    if (isOfflineStrategy || !isInitPlayersEqual(request, setup) || setup.movesCash.generation != currentGeneration) {
        console.log('!!!!! releaseSetup !!!!');
        console.log(bbSize);
        setup.addonSetup = addonUtils.getSetup(bbSize);
        setup.resetCash();
        setup.movesCash.generation = currentGeneration;
        setup.hillsCash = [];
        setup.movesInEngine = 0;
        isCashSteelUseful = false;

        //////////////////////////////////////// SETTING PLAYERS
        for (let i = 0; i < request.players.length; i++) {
            // test empty adaptation
            // const adaptArr = [];
            // for (let i = 0; i < adapt_size; i++) {
            //     adaptArr.push(0);
            // }

            const nickname = request.players[i].name;
            const stack = parseInt(request.players[i].stack * 100);
            const position = request.players[i].position;

            const cashPlayer = {
                nickname,
                stack,
                position,
            };

            console.log(`set player/// position: ${position}, stack: ${stack}`);
            setup.addonSetup.set_player(position, stack);
            setup.movesCash.players.push(cashPlayer);
        }

    }


    // preflop moves		popMoves(i);
    //
    // flop board 			popMoves(setup.movesCash.preflop.length);
    // flop moves			popMoves(setup.movesCash.preflop.length + 1 + i);
    //
    // turn board			popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 1);
    // turn moves			popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 2 + i);
    //
    // river board 			popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 2);
    // river moves			popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 3 + i);

    //////////////////////////////////////// PREFLOP MOVES
    const playersInvestPreflop = {};
    for (let i = 0; i < request.actions.preflop.length; i++) {
        let curInvest = 0;
        if (request.actions.preflop[i].position in playersInvestPreflop) {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100)) - playersInvestPreflop[request.actions.preflop[i].position]
        } else {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
        }

        const maxAmount = i > 0 ? (getMaxAmount(request.actions.preflop, i - 1) * 100) : 0;
        let maxAmountRaise;
        if (parseInt(Math.round(+request.actions.preflop[i].amount * 100)) > maxAmount) {
            maxAmountRaise = parseInt(Math.round(+request.actions.preflop[i].amount * 100)) - maxAmount;
        } else if (parseInt(Math.round(+request.actions.preflop[i].amount * 100)) <= maxAmount) {
            maxAmountRaise = request.actions.preflop[i].action === 5 ? -1 : 0;
        }

        const position = request.actions.preflop[i].position;
        const action = i < 2 ? 0 : request.actions.preflop[i].action;
        const pushHintMoveData = {
            curInvest,
            position,
            action,
        };

        // получаем сайзинги из аддона
        const sizings = [];  // набор всех сайзингов на улице: 0 - bet, 1 - raise, 2 - reraise
        const maxDeviationsPercent = enumPoker.enumPoker.perfomancePolicy.deviationSizings[0];  // preflop  [0.15, 0.2, 0.25]

        if (!_.isEqual(setup.movesCash.preflop[i], pushHintMoveData) || playUtils.isNonStandartSizings(rawActionList, 0, sizings, maxDeviationsPercent)) {     // no using cash
            if (isCashSteelUseful) {        // if we used cash before this iteration
                popMoves(i, setup);
            }
            isCashSteelUseful = false;

            let cash = [];
            if (i > 1) {
                const nodeSimulation = isNodeSimulation(0, i);
                cash = await getHill(position, maxAmountRaise, movesCount, setup, nodeSimulation, simSession).then(arr => arr);
                if (cash === null) {
                    break;
                }
            }

            setup.hillsCash[movesCount] = { position, cash,  isPreflop: true };      // PREFLOP!!!

            const result = setup.addonSetup.push_move(position, curInvest, action);
            console.log(`setup.addonSetup.push_move(position: ${position}, curInvest: ${curInvest}, action: ${action}), pushResult: ${result}`);

            setup.movesInEngine++;
            setup.movesCash.preflop.push(pushHintMoveData);
        }

        if (nodeId === movesCount) {
            return getAllHandStrategy(setup.hillsCash[movesCount].cash, undefined, setup);
        }
        movesCount++;
        playersInvestPreflop[position] = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
    }

    //////////////////////////////////////// PUSH FLOP BOARD
    if (request.actions.flop || (request.board.c1 && nodeId === movesCount + 1)) {
        const isC1Equal = request.board.c1 === setup.movesCash.c1;
        const isC2Equal = request.board.c2 === setup.movesCash.c2;
        const isC3Equal = request.board.c3 === setup.movesCash.c3;
        if (!(isC1Equal && isC2Equal && isC3Equal)) {
            if (isCashSteelUseful) {
                console.log('flop board pop moves');
                popMoves(setup.movesCash.preflop.length, setup);
                setup.movesCash.flop = [];
                setup.movesCash.turn = [];
                setup.movesCash.river = [];
                setup.movesCash.c4 = null;
                setup.movesCash.c5 = null;
            }
            isCashSteelUseful = false;

            const flopPush = setup.addonSetup.push_move(
                enumPoker.enumPoker.dealPositions.DEALPOS_FLOP,
                enumPoker.enumPoker.cardsName.indexOf(request.board.c1),
                enumPoker.enumPoker.cardsName.indexOf(request.board.c2),
                enumPoker.enumPoker.cardsName.indexOf(request.board.c3)
            );

            console.log('flopPush');
            console.log(flopPush);
            // console.log(`c1: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c1)}, c2: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c2)}, c3: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c3)}`);

            setup.movesCash.c1 = request.board.c1;
            setup.movesCash.c2 = request.board.c2;
            setup.movesCash.c3 = request.board.c3;
            setup.movesInEngine++;
        }


        //////////////////////////////////////// FLOP MOVES
        const playersInvestFlop = {};
        for (let i = 0; i < request.actions.flop.length; i++) {
            let curInvest = 0;
            if (request.actions.flop[i].position in playersInvestFlop) {
                curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100)) - playersInvestFlop[request.actions.flop[i].position]
            } else {
                curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100));
            }

            const maxAmount = i > 0 ? (getMaxAmount(request.actions.flop, i - 1) * 100) : 0;
            let maxAmountRaise;
            if (parseInt(Math.round(+request.actions.flop[i].amount * 100)) > maxAmount) {
                maxAmountRaise = parseInt(Math.round(+request.actions.flop[i].amount * 100)) - maxAmount;
            } else if (parseInt(Math.round(+request.actions.flop[i].amount * 100)) <= maxAmount) {
                maxAmountRaise = request.actions.flop[i].action === 5 ? -1 : 0;
            }

            const position = request.actions.flop[i].position;
            const action = request.actions.flop[i].action;
            const pushHintMoveData = {
                curInvest,
                position,
                action,
            };

            if (!_.isEqual(setup.movesCash.flop[i], pushHintMoveData)) {      // no using cash
                if (isCashSteelUseful) {        // if we used cash before this iteration
                    // console.log('flop pop moves');
                    popMoves(setup.movesCash.preflop.length + 1 + i, setup);
                }
                isCashSteelUseful = false;

                const nodeSimulation = isNodeSimulation(1, i);
                const cash = await getHill(position, maxAmountRaise, movesCount, setup, nodeSimulation, simSession);
                if (cash === null) {
                    break;
                }
                setup.hillsCash[movesCount] = { position, cash,  isPreflop: false };

                const result = setup.addonSetup.push_move(position, curInvest, action);
                console.log(`setup.addonSetup.push_move(position: ${position}, curInvest: ${curInvest}, action: ${action}), pushResult: ${result}`);

                setup.movesInEngine++;
                setup.movesCash.flop.push(pushHintMoveData);
            }

            if (nodeId === movesCount) {
                return getAllHandStrategy(setup.hillsCash[movesCount].cash, position, setup);
            }
            movesCount++;
            playersInvestFlop[position] = parseInt(Math.round(+request.actions.flop[i].amount * 100));
        }
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

        //////////////////////////////////////// TURN MOVES
        const playersInvestTurn = {};
        for (let i = 0; i < request.actions.turn.length; i++) {
            let curInvest = 0;
            if (request.actions.turn[i].position in playersInvestTurn) {
                curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100)) - playersInvestTurn[request.actions.turn[i].position]
            } else {
                curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100));
            }

            const maxAmount = i > 0 ? (getMaxAmount(request.actions.turn, i - 1) * 100) : 0;
            let maxAmountRaise;
            if (parseInt(Math.round(+request.actions.turn[i].amount * 100)) > maxAmount) {
                maxAmountRaise = parseInt(Math.round(+request.actions.turn[i].amount * 100)) - maxAmount;
            } else if (parseInt(Math.round(+request.actions.turn[i].amount * 100)) <= maxAmount) {
                maxAmountRaise = request.actions.turn[i].action === 5 ? -1 : 0;
            }

            const position = request.actions.turn[i].position;
            const action = request.actions.turn[i].action;
            const pushHintMoveData = {
                curInvest,
                position,
                action,
            };

            if (!_.isEqual(setup.movesCash.turn[i], pushHintMoveData)) {      // no using cash
                if (isCashSteelUseful) {        // if we used cash before this iteration
                    // console.log('turn pop moves');
                    popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 2 + i, setup);
                }
                isCashSteelUseful = false;

                const nodeSimulation = isNodeSimulation(2, i);
                const cash = await getHill(position, maxAmountRaise, movesCount, setup, nodeSimulation, simSession);
                if (cash === null) {
                    break;
                }
                setup.hillsCash[movesCount] = { position, cash,  isPreflop: false };

                const result = setup.addonSetup.push_move(position, curInvest, action);
                console.log(`setup.addonSetup.push_move(position: ${position}, curInvest: ${curInvest}, action: ${action}), pushResult: ${result}`);

                setup.movesInEngine++;
                setup.movesCash.turn.push(pushHintMoveData);
            }

            if (nodeId === movesCount) {
                return getAllHandStrategy(setup.hillsCash[movesCount].cash, position, setup);
            }
            movesCount++;
            playersInvestTurn[position] = parseInt(Math.round(+request.actions.turn[i].amount * 100));
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

        //////////////////////////////////////// RIVER MOVES
        const playersInvestRiver = {};
        for (let i = 0; i < request.actions.river.length; i++) {
            let curInvest = 0;
            if (request.actions.river[i].position in playersInvestRiver) {
                curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100)) - playersInvestRiver[request.actions.river[i].position]
            } else {
                curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100));
            }

            const maxAmount = i > 0 ? (getMaxAmount(request.actions.river, i - 1) * 100) : 0;
            let maxAmountRaise;
            if (parseInt(Math.round(+request.actions.river[i].amount * 100)) > maxAmount) {
                maxAmountRaise = parseInt(Math.round(+request.actions.river[i].amount * 100)) - maxAmount;
            } else if (parseInt(Math.round(+request.actions.river[i].amount * 100)) <= maxAmount) {
                maxAmountRaise = request.actions.river[i].action === 5 ? -1 : 0;
            }

            const position = request.actions.river[i].position;
            const action = request.actions.river[i].action;
            const pushHintMoveData = {
                curInvest,
                position,
                action,
            };

            if (!_.isEqual(setup.movesCash.river[i], pushHintMoveData)) {      // no using cash
                if (isCashSteelUseful) {        // if we used cash before this iteration
                    // console.log('river pop moves');
                    popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 3 + i, setup);
                }
                isCashSteelUseful = false;

                const nodeSimulation = isNodeSimulation(3, i);
                const cash = await getHill(position, maxAmountRaise, movesCount, setup, nodeSimulation, simSession);
                if (cash === null) {
                    break;
                }
                setup.hillsCash[movesCount] = { position, cash,  isPreflop: false };

                const result = setup.addonSetup.push_move(position, curInvest, action);
                console.log(`setup.addonSetup.push_move(position: ${position}, curInvest: ${curInvest}, action: ${action}), pushResult: ${result}`);

                setup.movesInEngine++;
                setup.movesCash.river.push(pushHintMoveData);
            }

            if (nodeId === movesCount) {
                return getAllHandStrategy(setup.hillsCash[movesCount].cash, position, setup);
            }
            movesCount++;
            playersInvestRiver[position] = parseInt(Math.round(+request.actions.river[i].amount * 100));
        }
    }
};

module.exports.movesHandler = movesHandler;
module.exports.changeAddonPath = changeAddonPath;
module.exports.generationsNames = generationsNames;