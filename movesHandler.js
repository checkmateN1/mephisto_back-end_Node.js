const PokerEngine = require('./pokerEngine');
const middleware = require('./engineMiddleware_work');
const enumPoker = require('./enum');

const _ = require('lodash');


const adapt_size = 10;

// simulator only!
const movesHandler = (request, bbSize, setup) => {
    let isCashSteelUseful = !_.isEqual(setup.initCash, setup.movesCash);

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
        PokerEngine.ReleaseSetup(setup.engineID);
        setup.engineID = PokerEngine.InitSetup(bbSize);
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

            PokerEngine.SetPlayer(setup.engineID, stack, position, adaptArr);
            setup.movesCash.players.push(cashPlayer);
        }
    }

    const popMoves = (nMove) => {
        setup.hillsCash.length = nMove;


        console.log(`popMoves... nMove: ${nMove}, setup.movesInEngine: ${setup.movesInEngine}`);
        while(setup.movesInEngine > nMove && setup.movesInEngine > 0) {
            PokerEngine.PopMove(setup.engineID);
            setup.movesInEngine--;
        }
    };

    const getHill = (nIdMove, position, curInvest, sizings) => {
        console.log('start getHill!');
        const strategy = middleware.getAllHandsStrategy(setup, nIdMove, request, sizings);

        // ищем есть ли в setup.hillsCash совпадение по позициям и если да - берем горб из объекта с самым высоким индексом
        const index = setup.hillsCash.reduceRight((index, cur, i) => {
            if (index === -1) {
                if (cur.position === position && nIdMove > i) {
                    return i;
                }
            }
            return index;
        }, -1);

        return strategy.allHands.map((hand, i) => {
            let weight;
            if (hand.weight < 0) {
                weight = -1;
            } else {
                weight = ((index !== -1 && index > 1) ? setup.hillsCash[index].hill[i].weight : 1) * hand.moves[1].strategy;  // 1 between curInvest
            }
            return { hand: hand.hand, weight };
        });
    };

    //////////////////////////////////////// PREFLOP MOVES
    const playersInvestPreflop = {};
    for (let i = 0; i < request.actions.preflop.length; i++) {
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

        if (!_.isEqual(setup.movesCash.preflop[i], pushHintMoveData)) {      // no using cash
            if (isCashSteelUseful) {        // if we used cash before this iteration
                console.log('preflop pop moves');
                popMoves(i);
            }
            isCashSteelUseful = false;
            const nIdMove = PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
            setup.movesCash.preflop.push(pushHintMoveData);
            setup.movesInEngine++;

            let hill = [];
            if (i > 1) {
                hill = getHill(nIdMove, position, curInvest, [-1,0,1]);
            }

            setup.hillsCash[nIdMove] = { position, hill };
        }
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
            PokerEngine.PushBoard3Move(
                setup.engineID,
                enumPoker.enumPoker.cardsName.indexOf(request.board.c1),
                enumPoker.enumPoker.cardsName.indexOf(request.board.c2),
                enumPoker.enumPoker.cardsName.indexOf(request.board.c3)
            );
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
                const nIdMove = PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
                setup.movesCash.flop.push(pushHintMoveData);
                setup.movesInEngine++;

                const hill = getHill(nIdMove, position, curInvest, [-1,0,1]);
                setup.hillsCash[nIdMove] = { position, hill };
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
            PokerEngine.PushBoard1Move(setup.engineID, enumPoker.enumPoker.cardsName.indexOf(request.board.c4));
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
                const nIdMove = PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
                setup.movesCash.turn.push(pushHintMoveData);
                setup.movesInEngine++;

                const hill = getHill(nIdMove, position, curInvest, [-1,0,1]);
                setup.hillsCash[nIdMove] = { position, hill };
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
            PokerEngine.PushBoard1Move(setup.engineID, enumPoker.enumPoker.cardsName.indexOf(request.board.c5));
            setup.movesCash.c5 = request.board.c5;
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
                const nIdMove = PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
                setup.movesCash.river.push(pushHintMoveData);
                setup.movesInEngine++;

                const hill = getHill(nIdMove, position, curInvest, [-1,0,1]);
                setup.hillsCash[nIdMove] = { position, hill };
            }
            playersInvestRiver[request.actions.river[i].position] = parseInt(Math.round(+request.actions.river[i].amount * 100));
        }
    }

};

module.exports.movesHandler = movesHandler;