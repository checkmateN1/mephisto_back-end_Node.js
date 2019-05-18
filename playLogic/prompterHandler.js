class Player {
    constructor(nickname, id, adaptation) {
        this.nickname = nickname;
        this.id = id;
        this.adaptation = adaptation;
    }
}

class InitPlayer {
    constructor(player, initBalance, position) {
        this.player = player;
        this.initBalance = initBalance;
        this.position = position;
    }
}

class PlayPlayer {
    constructor(initPlayer, curBalance, action, amount, isActive, cards) {
        this.initPlayer = initPlayer;
        this.curBalance = curBalance;
        this.action = action;
        this.betAmount = amount;
        this.isActive = isActive;
        this.cards = cards;
    }
}

class PlayFrame {
    constructor(pot, playPlayers, board) {
        this.pot = pot;
        this.playPlayers = playPlayers;
        this.board = board;
    }
}

class Setup {
    constructor(initPlayers, handNumber, bbSize) {
        this.initPlayers = initPlayers;
        this.handNumber = handNumber;
        this.bbSize = bbSize;
        this.moves = [];
        this.frames = [];
        this.movesStreetMap = [];
    }
    appendMove(moves) {

    }

    // PokerEngine.PushHintMove(setupID, invest, position, action);
    frameToMoves(playFrame) {
        let moves = [];


        return moves;
    }

    // call when !this.frames.length
    getStartFrame(firstValidFrame) {

        this.frames.push();
    };
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
rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 8, false, false); // post BB  -30
rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 0, false, false);       // bet 0.75 BTN   -55
rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 8, false, false);   // call BB
rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 0, false, false);       // bet 0.75 BTN   -55

// test frames from validator
let frame = new PlayFrame();


// test ha
let initPlayers = [];
initPlayers.push(new InitPlayer(new Player('checkmateN1', 1111, [1, 1, 1, 1]), 725, 8));
initPlayers.push(new InitPlayer(new Player('joooe84', 2222, [2, 2, 2, 2]), 500, 0));

let playPlayer = new PlayPlayer(initPlayer, 50, 2, 50, true);

module.exports.prompterListener = prompterListener;
module.exports.getBBsize = getBBsize;



// classes logic test
// let player = new Player('joe', 1111, [1, 2, 3, 4]);
// let initPlayer = new InitPlayer(player, 100, 2);
// let playPlayer = new PlayPlayer(initPlayer, 50, 2, 50, true);
//
// player.nickname = 'checkmate';
//
// console.log(player);
// console.log('--------------------------');
// console.log(initPlayer);
// console.log('--------------------------');
// console.log(playPlayer);

