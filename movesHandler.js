// const PokerEngine = require('./pokerEngine');  // molotok
// const middleware = require('./engineMiddleware_work');   // molotok
const enumPoker = require('./enum');

const _ = require('lodash');
const adapt_size = 10;

addon = require('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon');
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

// simulator only!
const movesHandler = (request, bbSize, setup, nodeId) => {      // nodeId - начиная с нуля... первый ход префлопа после постов - nodeId === 2. Пуш борд не считаем
    console.log(`enter moves handler!!`);
    let isCashSteelUseful = !_.isEqual(setup.initCash, setup.movesCash);
    let movesCount = 0;

    console.log('setup.movesInEngine at start of movesHandler');
    console.log(setup.movesInEngine);

    const isInitPlayersEqual = () => {
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

    if (!isInitPlayersEqual()) {
        console.log('!!!!! releaseSetup !!!!');
        console.log(bbSize);
        setup.addonSetup = new addon.Setup(bbSize);
        setup.resetCash();
        setup.hillsCash = [];
        isCashSteelUseful = false;

        //////////////////////////////////////// SETTING PLAYERS
        for (let i = 0; i < request.players.length; i++) {
            // test empty adaptation
            const adaptArr = [];
            for (let i = 0; i < adapt_size; i++) {
                adaptArr.push(0);
            }

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

    const popMoves = (nMove) => {
        setup.hillsCash.length = nMove;


        console.log(`popMoves... nMove: ${nMove}, setup.movesInEngine: ${setup.movesInEngine}`);
        while(setup.movesInEngine > nMove && setup.movesInEngine > 0) {
            setup.addonSetup.pop_move();
            setup.movesInEngine--;
        }
    };

    const getSizings = (pot, count, ) => {

    };

    const getHill = (position, curInvest, sizings) => {
        console.log('start getHill!');
        const strategy = aggregator.aggregate_all(setup.addonSetup);
        console.log(`get strategy success!`);

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

        if (nodeId === movesCount) {        // нашли целевой узел из запроса - возвращаем стратегию
            console.log(`inside getHill /// found target node. Previous node: ${index}`);
            const allHandsStrategy = {     // simulator format
                allHands: textHandsArr.map((hand, i) => {
                    let weight;
                    if (!(i in strategy)) {
                        weight = -1;
                    } else {
                        // console.log('setup.hillsCash[index].hill[i].weight');
                        // console.log(setup.hillsCash[index].hill[i].weight);        // NAN allin
                        weight = ((index !== -1 && index > 1) ? setup.hillsCash[index].hill[i].weight : 1);
                        // console.log(weight);
                    }
                    const strat = {};
                    if (strategy[i]) {
                        Object.keys(strategy[i]).forEach(key => {
                            strat[key == -1 ? -1 : parseInt(key)/100] = {
                                strategy: strategy[i][key],
                                ev: 0
                            };
                        })
                    }

                    return {
                        hand,
                        weight,
                        preflopWeight: 1,
                        moves: strat,
                    };
                })
            };

            return  allHandsStrategy;
        }

        return textHandsArr.map((hand, i) => {
            let weight;
            if (!(i in strategy)) {
                weight = -1;
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
                weight = ((index !== -1 && index > 1) ? setup.hillsCash[index].hill[i].weight : 1) * strategy[i][curInvest];  // 1 instead curInvest
                if (index === 0) {

                }
            }
            return { hand, weight };
        });
    };

    //////////////////////////////////////// PREFLOP MOVES
    const playersInvestPreflop = {};
    for (let i = 0; i < request.actions.preflop.length; i++) {
        if (nodeId < movesCount) {

        }
        let curInvest = 0;
        if (request.actions.preflop[i].position in playersInvestPreflop) {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100)) - playersInvestPreflop[request.actions.preflop[i].position]
        } else {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
        }

        const position = request.actions.preflop[i].position;
        const action = i < 2 ? 0 : request.actions.preflop[i].action;
        const pushHintMoveData = {
            curInvest,
            position,
            action,
        };

        console.log('setup.hillsCash');
        console.log(setup.hillsCash);

        console.log('setup.movesCash.preflop');
        console.log(setup.movesCash.preflop);

        if (!_.isEqual(setup.movesCash.preflop[i], pushHintMoveData)) {      // no using cash
            if (isCashSteelUseful) {        // if we used cash before this iteration
                console.log('preflop pop moves');
                popMoves(i);
            }
            isCashSteelUseful = false;

            let hill = [];
            if (i > 1) {
                hill = getHill(position, curInvest, [-1,0,1]);
                if (nodeId === movesCount) {
                    return hill;
                }
            }

            setup.hillsCash[movesCount] = { position, hill };

            const result = setup.addonSetup.push_move(position, curInvest, action);
            console.log(`setup.addonSetup.push_move(position: ${position}, curInvest: ${curInvest}, action: ${action}), pushResult: ${result}`);

            setup.movesInEngine++;
            setup.movesCash.preflop.push(pushHintMoveData);
        }

        if (nodeId === movesCount) {
            console.log('preflop pop moves');
            popMoves(i);
            return getHill(position, curInvest, [-1,0,1]);
        }
        movesCount++;
        playersInvestPreflop[position] = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
    }


    //////////////////////////////////////// PUSH FLOP BOARD
    if (request.actions.flop) {
        const isC1Equal = request.board.c1 === setup.movesCash.c1;
        const isC2Equal = request.board.c2 === setup.movesCash.c2;
        const isC3Equal = request.board.c3 === setup.movesCash.c3;
        if (!(isC1Equal && isC2Equal && isC3Equal)) {
            if (isCashSteelUseful) {
                console.log('flop board pop moves');
                popMoves(setup.movesCash.preflop.length);
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
            console.log(`c1: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c1)}, c2: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c2)}, c3: ${enumPoker.enumPoker.cardsName.indexOf(request.board.c3)}`);

            setup.movesCash.c1 = request.board.c1;
            setup.movesCash.c2 = request.board.c2;
            setup.movesCash.c3 = request.board.c3;
            setup.movesInEngine++;
        }


        console.log('test cash before flop moves');

        //////////////////////////////////////// FLOP MOVES
        const playersInvestFlop = {};
        for (let i = 0; i < request.actions.flop.length; i++) {
            let curInvest = 0;
            if (request.actions.flop[i].position in playersInvestFlop) {
                curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100)) - playersInvestFlop[request.actions.flop[i].position]
            } else {
                curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100));
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
                    console.log('flop pop moves');
                    popMoves(setup.movesCash.preflop.length + 1 + i);
                }
                isCashSteelUseful = false;

                console.log(`test flop/// nodeId: ${nodeId}, movesCount: ${movesCount}, position: ${position}, curInvest: ${curInvest}, setup.movesInEngine: ${setup.movesInEngine}`);

                console.log(`before flop getHill/// `);
                const hill = getHill(position, curInvest, [-1,0,1]);
                if (nodeId === movesCount) {
                    return hill;
                }
                setup.hillsCash[movesCount] = { position, hill };

                setup.addonSetup.push_move(position, curInvest, action);
                movesCount++;
                setup.movesCash.flop.push(pushHintMoveData);
                setup.movesInEngine++;
            }
            playersInvestFlop[position] = parseInt(Math.round(+request.actions.flop[i].amount * 100));
        }
    }

    console.log('test cash before turn board');


    //////////////////////////////////////// PUSH TURN
    if (request.actions.turn) {
        if (request.board.c4 !== setup.movesCash.c4) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 1);
            }
            isCashSteelUseful = false;
            setup.addonSetup.push_move(enumPoker.enumPoker.dealPositions.DEALPOS_TURN, enumPoker.enumPoker.cardsName.indexOf(request.board.c4));
            setup.movesCash.c4 = request.board.c4;
            setup.movesInEngine++;
        }

        //////////////////////////////////////// TURN MOVES
        const playersInvestTurn = {};
        for (let i = 0; i < request.actions.turn.length; i++) {
            let curInvest = 0;
            if (request.actions.turn[i].position in playersInvestTurn) {
                curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100)) - playersInvestTurn[request.actions.turn[i].position]
            } else {curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100))}

            const position = request.actions.turn[i].position;
            const action = request.actions.turn[i].action;
            const pushHintMoveData = {
                curInvest,
                position,
                action,
            };

            if (!_.isEqual(setup.movesCash.turn[i], pushHintMoveData)) {      // no using cash
                if (isCashSteelUseful) {        // if we used cash before this iteration
                    popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 2 + i);
                }
                isCashSteelUseful = false;

                const hill = getHill(position, curInvest, [-1,0,1]);
                if (nodeId === movesCount) {
                    return hill;
                }
                setup.hillsCash[movesCount] = { position, hill };

                setup.addonSetup.push_move(position, curInvest, action);
                movesCount++;
                setup.movesCash.turn.push(pushHintMoveData);
                setup.movesInEngine++;
            }
            playersInvestTurn[request.actions.turn[i].position] = parseInt(Math.round(+request.actions.turn[i].amount * 100));
        }
    }


    //////////////////////////////////////// PUSH RIVER
    if (request.actions.river) {
        if (request.board.c5 !== setup.movesCash.c5) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 2);
            }
            isCashSteelUseful = false;
            setup.addonSetup.push_move(enumPoker.enumPoker.dealPositions.DEALPOS_RIVER, enumPoker.enumPoker.cardsName.indexOf(request.board.c5));
            setup.movesCash.c5 = request.board.c5;
            setup.movesInEngine++;
        }

        //////////////////////////////////////// RIVER MOVES
        const playersInvestRiver = {};
        for (let i = 0; i < request.actions.river.length; i++) {
            let curInvest = 0;
            if (request.actions.river[i].position in playersInvestRiver) {
                curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100)) - playersInvestRiver[request.actions.river[i].position]
            } else {curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100))}

            const position = request.actions.river[i].position;
            const action = request.actions.river[i].action;
            const pushHintMoveData = {
                curInvest,
                position,
                action,
            };

            if (!_.isEqual(setup.movesCash.river[i], pushHintMoveData)) {      // no using cash
                if (isCashSteelUseful) {        // if we used cash before this iteration
                    popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 3 + i);
                }
                isCashSteelUseful = false;

                const hill = getHill(position, curInvest, [-1,0,1]);
                if (nodeId === movesCount) {
                    return hill;
                }
                setup.hillsCash[movesCount] = { position, hill };

                setup.addonSetup.push_move(position, curInvest, action);
                movesCount++;
                setup.movesCash.river.push(pushHintMoveData);
                setup.movesInEngine++;
            }
            playersInvestRiver[request.actions.river[i].position] = parseInt(Math.round(+request.actions.river[i].amount * 100));
        }
    }

};

module.exports.movesHandler = movesHandler;