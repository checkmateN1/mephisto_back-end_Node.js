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

    if (!isInitPlayersEqual) {
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

            const stack = parseInt(request.players[i].stack * 100);
            const position = request.players[i].position;

            PokerEngine.SetPlayer(setup.engineID, stack, position, adaptArr);
        }
    }

    const popMoves = (nMove) => {
        while(PokerEngine.GetLastMoveId(setup.engineID) >= nMove) {
            PokerEngine.PopMove(setup.engineID);
        }
    };

    const movesInvestArr = [];

    //////////////////////////////////////// PREFLOP MOVES
    let playersInvestPreflop = {};
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

        if (!isCashSteelUseful && !_.isEqual(setup.movesCash.preflop[i], pushHintMoveData)) {      // no using cash
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
        return [newSetupID, movesInvestArr];
    } else {
        request.board.c1
        if (isCashSteelUseful) {

        } else {
            PokerEngine.PushBoard3Move(newSetupID, enumPoker.cardsName.indexOf(request.board.c1), enumPoker.cardsName.indexOf(request.board.c2), enumPoker.cardsName.indexOf(request.board.c3));
        }
    }

    // console.log(`PushBoard3Move(${newSetupID}, ${enumPoker.cardsName.indexOf(request.board.c1)}, ${enumPoker.cardsName.indexOf(request.board.c2)}, ${enumPoker.cardsName.indexOf(request.board.c3)})`);


    //////////////////////////////////////// FLOP MOVES
    let playersInvestFlop = {};
    for (let i = 0; i < request.actions.flop.length; i++) {
        let curInvest = 0;
        if (request.actions.flop[i].position in playersInvestFlop) {
            curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100)) - playersInvestFlop[request.actions.flop[i].position]
        } else {
            curInvest = parseInt(Math.round(+request.actions.flop[i].amount * 100));
        }
        movesInvestArr.push(curInvest);
        // console.log(`PushHintMove(${newSetupID}, ${curInvest}, ${request.actions.flop[i].position}, ${request.actions.flop[i].action})`);
        let testFlopPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.flop[i].position, request.actions.flop[i].action);
        playersInvestFlop[request.actions.flop[i].position] = parseInt(Math.round(+request.actions.flop[i].amount * 100));
    }


    //////////////////////////////////////// PUSH FLOP
    if (!request.actions.turn) {
        return [newSetupID, movesInvestArr];
    } else {
        console.log('trying to push turn board');
        const turnBoardTest = PokerEngine.PushBoardMove(newSetupID, enumPoker.cardsName.indexOf(request.board.c4));
        console.log(turnBoardTest);
    }


    //////////////////////////////////////// TURN MOVES
    let playersInvestTurn = {};
    for (let i = 0; i < request.actions.turn.length; i++) {
        let curInvest = 0;
        if (request.actions.flop[i].position in playersInvestTurn) {
            curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100)) - playersInvestTurn[request.actions.turn[i].position]
        } else {curInvest = parseInt(Math.round(+request.actions.turn[i].amount * 100))}
        movesInvestArr.push(curInvest);
        let testTurnPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.turn[i].position, request.actions.turn[i].action);
        playersInvestTurn[request.actions.turn[i].position] = parseInt(Math.round(+request.actions.turn[i].amount * 100));
    }


    // if (!request.actions.turn.length) {return newSetupID}
    // PokerEngine.PushBoardMove(newSetupID, enumPoker.cardsName.indexOf(request.board.c4));
    //
    // for (let i = 0; i < request.actions.turn.length; i++) {
    //     PokerEngine.PushHintMove(newSetupID, parseInt(parseFloat(request.actions.turn[i].amount) * 100), request.actions.turn[i].position, i < 2 ? 0 : request.actions.turn[i].action);
    // }
    //
    // if (!request.actions.river.length) {return newSetupID}
    // PokerEngine.PushBoardMove(newSetupID, enumPoker.cardsName.indexOf(request.board.c5));
    //
    // for (let i = 0; i < request.actions.river.length; i++) {
    //     PokerEngine.PushHintMove(newSetupID, parseInt(parseFloat(request.actions.river[i].amount) * 100), request.actions.river[i].position, i < 2 ? 0 : request.actions.river[i].action);
    // }

    return [newSetupID, movesInvestArr];
};

// let nengineID = PokerEngine.InitSetup(30);
//
// let adaptArr = [];
// for (let i = 0; i < 50; i++) {
//     adaptArr.push(0);
// }
//
// PokerEngine.SetPlayer(nengineID, 480, 8, adaptArr); // linkki7  bb
// PokerEngine.SetPlayer(nengineID, 1020, 0, adaptArr); // myrddin33 btn
//
// let move0 = PokerEngine.PushHintMove(nengineID, 15, 0, 0);
// let move1 = PokerEngine.PushHintMove(nengineID, 30, 8, 0);
// let move2 = PokerEngine.PushHintMove(nengineID, 45, 0, 2);
// let move3 = PokerEngine.PushHintMove(nengineID, 30, 8, 3);
// let board = PokerEngine.PushBoard3Move(nengineID, enumPoker.cardsName.indexOf("2h"), enumPoker.cardsName.indexOf("3h"), enumPoker.cardsName.indexOf("5h"));
//
// console.log(move0);
// console.log(move1);
// console.log(move2);
// console.log(move3);
// console.log(board);

module.exports.movesHandler = movesHandler;