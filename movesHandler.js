const PokerEngine = require('./pokerEngine');
const enumPoker = require('./enum');

const _ = require('lodash');


const adapt_size = 10;

// simulator only!
const movesHandler = (request, bbSize, setup) => {
    console.log(request);

    let isCashSteelUseful = true;

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
        PokerEngine.ReleaseSetup(setup.engineID);
        setup.engineID = PokerEngine.InitSetup(bbSize);
        setup.resetCash();
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
        while(PokerEngine.GetLastMoveId(setup.engineID) >= nMove) {
            PokerEngine.PopMove(setup.engineID);
        }
    };

    const movesInvestArr = [];

    //////////////////////////////////////// PREFLOP MOVES
    const playersInvestPreflop = {};
    for (let i = 0; i < request.actions.preflop.length; i++) {
        let curInvest = 0;
        if (request.actions.preflop[i].position in playersInvestPreflop) {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100)) - playersInvestPreflop[request.actions.preflop[i].position]
        } else {
            curInvest = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
        }
        movesInvestArr.push(curInvest);

        const position = request.actions.preflop[i].position;
        const action = i < 2 ? 0 : request.actions.preflop[i].action;
        const pushHintMoveData = {
            curInvest,
            position,
            action,
        };

        if (!_.isEqual(setup.movesCash.preflop[i], pushHintMoveData)) {      // no using cash
            if (isCashSteelUseful) {        // if we used cash before this iteration
                popMoves(i);
            }
            isCashSteelUseful = false;
            PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
            setup.movesCash.preflop.push(pushHintMoveData);
        }
        playersInvestPreflop[position] = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
    }


    //////////////////////////////////////// PUSH FLOP
    if (!request.actions.flop) {
        return [setup.engineID, movesInvestArr];
    } else {
        const isC1Equal = request.board.c1 === setup.movesCash.c1;
        const isC2Equal = request.board.c2 === setup.movesCash.c2;
        const isC3Equal = request.board.c3 === setup.movesCash.c3;
        if (!(isC1Equal && isC2Equal && isC3Equal)) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length);
            }
            isCashSteelUseful = false;
            PokerEngine.PushBoard3Move(
                setup.engineID,
                enumPoker.cardsName.indexOf(request.board.c1),
                enumPoker.cardsName.indexOf(request.board.c2),
                enumPoker.cardsName.indexOf(request.board.c3)
            );
            setup.movesCash.c1 = request.board.c1;
            setup.movesCash.c2 = request.board.c2;
            setup.movesCash.c3 = request.board.c3;
        }
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
        movesInvestArr.push(curInvest);

        const position = request.actions.flop[i].position;
        const action = request.actions.flop[i].action;
        const pushHintMoveData = {
            curInvest,
            position,
            action,
        };

        if (!_.isEqual(setup.movesCash.flop[i], pushHintMoveData)) {      // no using cash
            if (isCashSteelUseful) {        // if we used cash before this iteration
                popMoves(setup.movesCash.preflop.length + 1 + i);
            }
            isCashSteelUseful = false;
            PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
            setup.movesCash.flop.push(pushHintMoveData);
        }
        playersInvestFlop[position] = parseInt(Math.round(+request.actions.flop[i].amount * 100));
    }


    //////////////////////////////////////// PUSH TURN
    if (!request.actions.turn) {
        return [setup.engineID, movesInvestArr];
    } else {
        if (request.board.c4 !== setup.movesCash.c4) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + 1);
            }
            isCashSteelUseful = false;
            PokerEngine.PushBoard1Move(setup.engineID, enumPoker.cardsName.indexOf(request.board.c4));
            setup.movesCash.c4 = request.board.c4;
        }
    }


    //////////////////////////////////////// TURN MOVES
    const playersInvestTurn = {};
    for (let i = 0; i < request.actions.turn.length; i++) {
        let curInvest = 0;
        if (request.actions.turn[i].position in playersInvestTurn) {
            curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100)) - playersInvestTurn[request.actions.turn[i].position]
        } else {curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100))}
        movesInvestArr.push(curInvest);

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
            PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
            setup.movesCash.turn.push(pushHintMoveData);
        }
        playersInvestTurn[request.actions.turn[i].position] = parseInt(Math.round(+request.actions.turn[i].amount * 100));
    }



    //////////////////////////////////////// PUSH RIVER
    if (!request.actions.river) {
        return [setup.engineID, movesInvestArr];
    } else {
        if (request.board.c5 !== setup.movesCash.c5) {
            if (isCashSteelUseful) {
                popMoves(setup.movesCash.preflop.length + setup.movesCash.flop.length + setup.movesCash.turn.length + 2);
            }
            isCashSteelUseful = false;
            PokerEngine.PushBoard1Move(setup.engineID, enumPoker.cardsName.indexOf(request.board.c4));
            setup.movesCash.c4 = request.board.c4;
        }
    }

    //////////////////////////////////////// RIVER MOVES
    const playersInvestRiver = {};
    for (let i = 0; i < request.actions.river.length; i++) {
        let curInvest = 0;
        if (request.actions.river[i].position in playersInvestRiver) {
            curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100)) - playersInvestRiver[request.actions.river[i].position]
        } else {curInvest = parseInt(Math.round(+request.actions.river[i].amount * 100))}
        movesInvestArr.push(curInvest);

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
            PokerEngine.PushHintMove(setup.engineID, curInvest, position, action);
            setup.movesCash.river.push(pushHintMoveData);
        }
        playersInvestRiver[request.actions.river[i].position] = parseInt(Math.round(+request.actions.river[i].amount * 100));
    }

    return [setup.engineID, movesInvestArr];
};

module.exports.movesHandler = movesHandler;