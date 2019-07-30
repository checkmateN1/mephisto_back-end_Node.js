const enumPoker = require('../enum');

const REJECT_HAND = 'reject hand';

class PlayersHandler {
    constructor() {
        this.cashPlayers = {};      // nickname: id
        this.players = {};          // id: adaptation
        this.defaultAdaptation = [1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    }

    getPlayerIdFromDB(recognitionNickname) {
        return 1111111;        // will implementing
    }
    getAdaptationFromDB(id) {
        return [1,1,1,1,1,1,1,1,1,1,1,1,1,1];        // will implementing
    }
    setPlayer(recognitionNickname) {
        let playerID = this.getPlayerIdFromDB(recognitionNickname);
        let adaptation = this.getAdaptationFromDB(playerID);

        if (playerID) {
            this.cashPlayers.recognitionNickname = playerID;
        }
        if (adaptation && adaptation.length) {
            this.players.playerID = adaptation;
        }
    }
    getAdaptation(recognitionNickname) {
        let adaptation = this.players[this.cashPlayers.recognitionNickname];

        if (adaptation && adaptation.length) {
            return adaptation;
        }
        this.setPlayer(recognitionNickname);
        adaptation = this.players[this.cashPlayers.recognitionNickname];

        if (adaptation && adaptation.length) {
            return adaptation;
        }
        return this.defaultAdaptation;
    }
}

class Player {
    constructor(id, adaptation) {
        this.id = id;
        this.adaptation = adaptation;
    }
}

class InitPlayer {
    constructor(player, initBalance, enumPosition) {
        this.player = player;
        this.initBalance = initBalance;
        this.enumPosition = enumPosition;
    }
}

class PlayPlayer {
    constructor(nickname, recognitionPosition, curBalance, amount, isActive, isDealer, cards) {
        this.nickname = nickname;
        this.recognitionPosition = recognitionPosition;
        this.curBalance = curBalance;
        this.betAmount = amount;
        this.isActive = isActive;
        this.isDealer = isDealer;
        this.cards = cards;
    }
}

class PlayFrame {
    constructor(handNumber, pot, playPlayers, board, isButtons) {
        this.handNumber = handNumber;
        this.pot = pot;
        this.playPlayers = playPlayers;
        this.board = board;
        this.isButtons = isButtons;
    }
}

// PokerEngine.PushHintMove(setupID, invest, position, action);
class Move {
    constructor(invest, enumPosition, action) {
        this.invest = invest;
        this.enumPosition = enumPosition;
        this.action = action;
    }
}

class Setup {
    constructor(playFrame) {            // frame from recognition -> validator.dll ->
        this.initPlayers = [];
        this.positionMap = {};
        this.handNumber = 0;
        this.bbSize = [];           // chronology of bb sizes
        this.moves = [];
        this.playFrames = [];
        this.rejectHand = false;
        this.frameHandler(playFrame);
    }
    appendMove(moves) {

    }

    // PokerEngine.PushHintMove(setupID, invest, position, action);
    frameHandler(playFrame) {
        console.log('playFrame prompterHandler');
        console.log(playFrame);
        if (this.rejectHand && playFrame.handNumber === this.handNumber) {
            return 'reject hand';
        }
        if (playFrame.handNumber !== this.handNumber) {         // new hand
            this.handNumber = playFrame.handNumber;
            this.initPlayers = [];
            this.positionEnumKeyMap = {};
            this.moves = [];
            this.playFrames = [];
            this.rejectHand = false;

            if (playFrame.board.length !== 0) {           // reject new hand with board cards
                this.rejectHand = true;
                return 'reject hand';
            }
            this.setInitPlayers(playFrame);
            this.setPositionsMap();
        }
        this.getMovesFromFrame(playFrame);

    };

    // let testPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.preflop[i].position, i < 2 ? 0 : request.actions.preflop[i].action);


    // frame1 = new PlayFrame(12345, 35, playPlayers, [], true);
    // playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, true,'');
    getMovesFromFrame(playFrame) {
        if (this.initPlayers.length <= 2) {       // ha
            if (this.moves.length === 0) {        // first frame
                let BTNAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BTN')]].betAmount;
                let BBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].betAmount;
                if (BBAmount > this.bbSize[this.bbSize.length - 1] * 3) {   // wrong BB recognition
                    this.rejectHand = true;
                    return true;
                } else if (this.bbSize.length > 2){
                    this.bbSize.shift();
                }
                this.bbSize.push(BBAmount);

                if (BTNAmount > BBAmount) {      // was raise
                    const SBSize = BBAmount / 2;
                    this.moves.push(new Move(SBSize, enumPoker.positions.indexOf('BTN'), 0));
                    this.moves.push(new Move(BBAmount, enumPoker.positions.indexOf('BB'), 0));
                }
            }
        }
    }

    wasBet(street) {

    }

    wasRaise() {

    }

    setInitPlayers(firstPlayFrame) {
        const activePlayers = firstPlayFrame.playPlayers.filter(player => player.isActive).length;
        const foldPlayers = firstPlayFrame.playPlayers.filter(player => !player.isActive && player.curBalance > 0.001).length;
        const playersWasActive = firstPlayFrame.playPlayers.filter(player => (player.isActive || !player.isActive && player.curBalance > 0.001));

        const p0Dealer = ['BTN', 'SB', 'BB'];
        const p1Dealer = ['BB', 'BTN', 'SB'];
        const p2Dealer = ['SB', 'BB', 'BTN'];
        const pXD = [p0Dealer, p1Dealer, p2Dealer];

        if (activePlayers === 2 && foldPlayers === 0) {    // ha
            console.log('2 players!');

            playersWasActive.forEach(player => {
                let iPlayer = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(player.isDealer ? 'BTN' : 'BB'));   // look up in telegram BB or SB

                this.initPlayers[player.recognitionPosition] = iPlayer;
            });
            // console.log(this.initPlayers);
        } else if (playersWasActive.length === 3) {     // spins or other 3 max
            console.log('3 players!');

            let pXDealer;
            playersWasActive.forEach(player => {
                if (player.isDealer) {
                    pXDealer = pXD[player.recognitionPosition];
                }
            });
            playersWasActive.forEach(player => {
                let iPlayer = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(pXDealer[player.recognitionPosition]));

                this.initPlayers[player.recognitionPosition] = iPlayer;
            });
        }
        console.log('this.initPlayers');
        console.log(this.initPlayers);
    }

    setPositionsMap() {
        this.initPlayers.forEach((initPlayer, index) => {
            this.positionEnumKeyMap[initPlayer.enumPosition] = index;
        });
        console.log('this.positionEnumKeyMap');
        console.log(this.positionEnumKeyMap);
    }

    getFirstChairToMove(isPreflop) {

    }

    movesOrder(numChairs, chairFrom, chairTo) {
        for(let ch = chairFrom; ch%numChairs !== chairTo; ch++) {
            console.log(ch%numChairs);
        }
    }



    // находим минимальную ставку оставшихся в игре и походивших от начала торгов на улице или предыдущего фрейма
    getMinSmartAmount(playFrame) {
        if (!this.playFrames.length) {          // first frame

            playFrame.playPlayers.forEach(player => {

            })
        }


    }

    getEV() {

    }
}

const getBBsize = (setupID, request) => {
    let bbSize = 50;

    return bbSize;
};

const prompterListener = (setupID, request) => {
    console.log('enter prompter listener');
};

// old actions for example
const rawActionList = [];
class ActionString {
    constructor(street, player, balance, action, pot, amount, position, gto, isHero) {
        this.street = street;
        this.player = player;
        this.balance = balance;
        this.action = action;
        this.pot = pot;
        this.amount = amount;
        this.position = position;
        this.gto = gto;
        this.isHero = isHero;
    }

    set setNickname(newNickname) {
        this.player = newNickname;
    }

};

// test ha old rawActionList for example
rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 0, false, false); // post BB  -30
rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 8, false, false);       // bet 0.75 BTN   -55
rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 0, false, false);   // call BB
rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8, false, false);

// test ha
// let initPlayers = [];
let playPlayers = [];

// export const positions = ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"];
playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, true,'');
playPlayers[1] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');
playPlayers[2] = new PlayPlayer('joooe84', 2, 475, 25, true, false,'AcAd');


// playPlayers[0] = new PlayPlayer('checkmateN1', 2, 715, 10, true, true,'');
// playPlayers[1] = new PlayPlayer('joooe84', 0, 475, 25, true, false,'AcAd');
// playPlayers[2] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');

let frame1 = new PlayFrame(12345, 35, playPlayers, [], true);
// console.log(frame1);
// console.log(enumPoker.positions[0]);

//let testSetup = new Setup(frame1);



module.exports.prompterListener = prompterListener;
module.exports.getBBsize = getBBsize;



