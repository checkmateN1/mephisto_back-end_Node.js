const PokerEngine = require('./pokerEngine');

const cardsName = ["2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As"];

const movesHandler = (idSetup, oldActions, request, bbSize, setup) => {
    PokerEngine.ReleaseSetup(idSetup);

    let newSetupID = PokerEngine.InitSetup(bbSize);
    let testSetPlayer = [];
    let adapt_size = 10;

    console.log(request);

    for (let i = 0; i < request.players.length; i++) {
        let adaptArr = [];
        for (let i = 0; i < adapt_size; i++) {
            adaptArr.push(0);
        }
        // POKERENGINE_API bool SetPlayer(int nIDSetup, int nStack, int nPos, float arrAdapt[ADAPT_SIZE]);
        // console.log(`SetPlayer(${newSetupID}, ${parseInt(request.players[i].stack * 100)}, ${request.players[i].position}, ${adaptArr}`);
        let testPLR = PokerEngine.SetPlayer(newSetupID, parseInt(request.players[i].stack * 100), request.players[i].position, adaptArr);
        testSetPlayer.push(testPLR);
    }

    let testPushHintMove = [];
    let playersInvestPreflop = {};
    for (let i = 0; i < request.actions.preflop.length; i++) {
        let curInvest = 0;
        if (request.actions.preflop[i].position in playersInvestPreflop) {
            curInvest = parseInt(parseFloat(request.actions.preflop[i].amount) * 100) - playersInvestPreflop[request.actions.preflop[i].position]
        } else {curInvest = parseInt(parseFloat(request.actions.preflop[i].amount) * 100);}
        // POKERENGINE_API int PushHintMove(int nIDSetup, int nMoney, int nPos, int nAct);
        // console.log(`PushHintMove(${newSetupID}, ${curInvest}, ${request.actions.preflop[i].position}, ${i < 2 ? 0 : request.actions.preflop[i].action})`);
        let testPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.preflop[i].position, i < 2 ? 0 : request.actions.preflop[i].action);
        testPushHintMove.push(testPush);
        setup.IdMoveForSimul = testPush;

        playersInvestPreflop[request.actions.preflop[i].position] = parseInt(parseFloat(request.actions.preflop[i].amount) * 100);
    }
    playersInvestPreflop = null;

    if (!request.actions.flop) {
        return newSetupID
    } else {
        let flopBoardTest = PokerEngine.PushBoard3Move(newSetupID, cardsName.indexOf(request.board.c1), cardsName.indexOf(request.board.c2), cardsName.indexOf(request.board.c3));
    }

    console.log(`PushBoard3Move(${newSetupID}, ${cardsName.indexOf(request.board.c1)}, ${cardsName.indexOf(request.board.c2)}, ${cardsName.indexOf(request.board.c3)})`);

    let playersInvestFlop = {};

    for (let i = 0; i < request.actions.flop.length; i++) {
        let curInvest = 0;
        if (request.actions.flop[i].position in playersInvestFlop) {
            curInvest = parseInt(parseFloat(request.actions.flop[i].amount) * 100) - playersInvestFlop[request.actions.flop[i].position]
        } else {curInvest = parseInt(parseFloat(request.actions.flop[i].amount) * 100);}
        // console.log(`PushHintMove(${newSetupID}, ${curInvest}, ${request.actions.flop[i].position}, ${request.actions.flop[i].action})`);
        let testFlopPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.flop[i].position, request.actions.flop[i].action);
        playersInvestFlop[request.actions.flop[i].position] = parseInt(parseFloat(request.actions.flop[i].amount) * 100);
    }
    playersInvestFlop = null;

    // return newSetupID;

    if (!request.actions.turn.length) {
        return newSetupID
    } else {
        console.log('trying to push turn board');
        let turnBoardTest = PokerEngine.PushBoardMove(newSetupID, cardsName.indexOf(request.board.c4));
        console.log(turnBoardTest);
    }

    let playersInvestTurn = {};

    for (let i = 0; i < request.actions.turn.length; i++) {
        let curInvest = 0;
        if (request.actions.flop[i].position in playersInvestTurn) {
            curInvest = parseInt(parseFloat(request.actions.turn[i].amount) * 100) - playersInvestTurn[request.actions.turn[i].position]
        } else {curInvest = parseInt(parseFloat(request.actions.turn[i].amount) * 100);}

        let testTurnPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.turn[i].position, request.actions.turn[i].action);
        playersInvestTurn[request.actions.turn[i].position] = parseInt(parseFloat(request.actions.turn[i].amount) * 100);
    }

    playersInvestTurn = null;


    // if (!request.actions.turn.length) {return newSetupID}
    // PokerEngine.PushBoardMove(newSetupID, cardsName.indexOf(request.board.c4));
    //
    // for (let i = 0; i < request.actions.turn.length; i++) {
    //     PokerEngine.PushHintMove(newSetupID, parseInt(parseFloat(request.actions.turn[i].amount) * 100), request.actions.turn[i].position, i < 2 ? 0 : request.actions.turn[i].action);
    // }
    //
    // if (!request.actions.river.length) {return newSetupID}
    // PokerEngine.PushBoardMove(newSetupID, cardsName.indexOf(request.board.c5));
    //
    // for (let i = 0; i < request.actions.river.length; i++) {
    //     PokerEngine.PushHintMove(newSetupID, parseInt(parseFloat(request.actions.river[i].amount) * 100), request.actions.river[i].position, i < 2 ? 0 : request.actions.river[i].action);
    // }

    return newSetupID;
};

// let nIDSetup = PokerEngine.InitSetup(30);
//
// let adaptArr = [];
// for (let i = 0; i < 50; i++) {
//     adaptArr.push(0);
// }
//
// PokerEngine.SetPlayer(nIDSetup, 480, 8, adaptArr); // linkki7  bb
// PokerEngine.SetPlayer(nIDSetup, 1020, 0, adaptArr); // myrddin33 btn
//
// let move0 = PokerEngine.PushHintMove(nIDSetup, 15, 0, 0);
// let move1 = PokerEngine.PushHintMove(nIDSetup, 30, 8, 0);
// let move2 = PokerEngine.PushHintMove(nIDSetup, 45, 0, 2);
// let move3 = PokerEngine.PushHintMove(nIDSetup, 30, 8, 3);
// let board = PokerEngine.PushBoard3Move(nIDSetup, cardsName.indexOf("2h"), cardsName.indexOf("3h"), cardsName.indexOf("5h"));
//
// console.log(move0);
// console.log(move1);
// console.log(move2);
// console.log(move3);
// console.log(board);

module.exports.movesHandler = movesHandler;