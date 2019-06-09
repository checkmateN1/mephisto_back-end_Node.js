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
    constructor(nickname, recognitionPosition, curBalance, amount, isActive, cards) {
        this.nickname = nickname;
        this.recognitionPosition = recognitionPosition;
        this.curBalance = curBalance;
        this.betAmount = amount;
        this.isActive = isActive;
        this.cards = cards;
    }
}

class PlayFrame {
    constructor(handNumber, pot, playPlayers, board) {
        this.handNumber = handNumber;
        this.pot = pot;
        this.playPlayers = playPlayers;
        this.board = board;
    }
}

class Setup {
    constructor(playFrame) {            // frame from recognition -> validator.dll ->
        this.initPlayers = [];
        this.handNumber = 0;
        this.bbSize = [];           // chronology of bb sizes
        this.moves = [];
        this.playFrames = [];
        this.frameHandler(playFrame);
    }
    appendMove(moves) {

    }

    // PokerEngine.PushHintMove(setupID, invest, position, action);
    frameHandler(playFrame) {
        if (playFrame.handNumber !== this.handNumber) {         // new hand
            this.handNumber = playFrame.handNumber;
            this.initPlayers = [];
            this.moves = [];

            // if (playFrame.board.c1) {
            //     return 'reject hand';
            // }
            this.setInitPlayers(playFrame);
        }
    };

    getMovesFromFrame(playFrame) {
        if (playFrame.playPlayers.length <= 2) {       // ha

        }
    }

    setInitPlayers(firstPlayFrame) {
        firstPlayFrame.playPlayers
    }

    getFirstChairToMove(isPreflop) {

    }

    movesOrder(numChairs, chairFrom, chairTo) {
        for(let ch = chairFrom; ch%numChairs !== chairTo; ch++) {
            console.log(ch%numChairs);
        }
    }

    // находим минимальную ставку оставшихся в игре и походивших от начала торгов на улице или предыдущего фрейма
    getMinAmountWithoutAllin(playFrame) {
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
playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, '');
playPlayers[1] = new PlayPlayer('joooe84', 2, 475, 25, true, 'AcAd');

let frame1 = new PlayFrame(12345, 35, playPlayers, '');
// console.log(frame1);
console.log(enumPoker.positions[0]);

let testSetup = new Setup({handNumber: 7777});
console.log(testSetup.handNumber);
// testSetup.movesOrder(3, 1, 0);



module.exports.prompterListener = prompterListener;
module.exports.getBBsize = getBBsize;



