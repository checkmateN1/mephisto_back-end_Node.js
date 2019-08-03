const PokerEngine = require('./pokerEngine');
const enumPoker = require('./enum');

const _ = require('lodash');

// let prevRequest = {};
// let prevEngineID;
// const movesStrategiesCash = [];

const adapt_size = 10;

// simulator only
const movesHandler = (engineID, oldActions, request, bbSize, setup) => {
    console.log(request);

    const isUsingCash = _.isEqual(request.players, setup.prevRequest.players);

    let newSetupID;
    let cash_act_num = 0;
    let testSetPlayer = [];
    let movesInvestArr = [];

    if (!isUsingCash) {
        if (setup.prevEngineID !== -1) {
            PokerEngine.ReleaseSetup(engineID);
            newSetupID = PokerEngine.InitSetup(bbSize);
            setup.movesStrategiesCash = [];
        } else {
            newSetupID = engineID;
        }

        //////////////////////////////////////// SETING PLAYERS
        for (let i = 0; i < request.players.length; i++) {
            let adaptArr = [];
            for (let i = 0; i < adapt_size; i++) {
                adaptArr.push(0);
            }
            // POKERENGINE_API bool SetPlayer(int nengineID, int nStack, int nPos, float arrAdapt[ADAPT_SIZE]);
            // console.log(`SetPlayer(${newSetupID}, ${parseInt(request.players[i].stack * 100)}, ${request.players[i].position}, ${adaptArr}`);
            let testPLR = PokerEngine.SetPlayer(newSetupID, parseInt(request.players[i].stack * 100), request.players[i].position, adaptArr);
            testSetPlayer.push(testPLR);
        }

    } else {
        newSetupID = setup.prevEngineID;
    }

    // const getLastCashIndex = () => {
    //     let lastCashIndex = 0;
    //
    //     for (let i = 0; i <= Math.min(setup.movesStrategiesCash.length, request.request.act_num); i++) {
    //         // проверяем совпадение борда на улице и действия
    //         if (true) {
    //
    //         } else break;
    //     }
    //     // setup.prevRequest
    // };

    let isCashSteelUseful = isUsingCash;
    let currentPushHintMoveCount = 0;       // считаем при каждом пуш мув независимо в кэше он или нет

    const cashMoves = {
        preflop: [{
            curInvest: null,
            position: null,
            action: null,
        }],
        flop: [],
        turn: [],
        river: [],
        c1: null,
        c2: null,
        c3: null,
        c4: null,
        c5: null,
    };

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
            action
        };

        currentPushHintMoveCount++;
        if (isCashSteelUseful && _.isEqual(cashMoves.preflop[i], pushHintMoveData)) {      // use cash

        } else {
            isCashSteelUseful = false;
            PokerEngine.PushHintMove(newSetupID, curInvest, position, action);
            // откатываем setup.pushHintMoveCount до текущего момента currentPushHintMoveCount

            setup.pushHintMoveCount = currentPushHintMoveCount;

            // откатываем поп_мувом движок до текущего мува

            // очищаем кэш мувов до текущего момента и добавляем новый мув
            // cashMoves

        }

        playersInvestPreflop[request.actions.preflop[i].position] = parseInt(Math.round(+request.actions.preflop[i].amount * 100));
    }
    playersInvestPreflop = null;


    //////////////////////////////////////// PUSH FLOP
    if (!request.actions.flop) {
        setup.engineID = newSetupID;
        return [newSetupID, movesInvestArr];
    } else {
        const flopBoardTest = PokerEngine.PushBoard3Move(newSetupID, enumPoker.cardsName.indexOf(request.board.c1), enumPoker.cardsName.indexOf(request.board.c2), enumPoker.cardsName.indexOf(request.board.c3));
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
    playersInvestFlop = null;


    //////////////////////////////////////// PUSH FLOP
    if (!request.actions.turn) {
        setup.engineID = newSetupID;
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

    playersInvestTurn = null;


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

    setup.engineID = newSetupID;
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