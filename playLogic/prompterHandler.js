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
    constructor(initPlayer, curBalance, moveType, betAmount, isActive, cards) {
        this.initPlayer = initPlayer;
        this.curBalance = curBalance;
        this.moveType = moveType;
        this.betAmount = betAmount;
        this.isActive = isActive;
        this.cards = cards;
    }
}

class PlayFrame {
    constructor(handNumber, pot, playPlayers) {
        this.handNumber = handNumber;
        this.pot = pot;
        this.players = players;
    }
}

class Setup {
    constructor(playersPositionsMap, handNumber, bbSize) {
        this.playersPositionsMap = playersPositionsMap;
        this.handNumber = handNumber;
        this.bbSize = bbSize;
        this.moves = [];
        this.movesStreetMap = [];
    }

    appendMove(moves) {

    }

    // returns moves in format
    // PokerEngine.PushHintMove(setupID, invest, position, action);
    rawStateToMoves(frame) {

    }
}

// classes logic test
let player = new Player('joe', 1111, [1, 2, 3, 4]);
let initPlayer = new InitPlayer(player, 100, 2);
let playPlayer = new PlayPlayer(initPlayer, 50, 2, 50, true);

player.nickname = 'checkmate';

console.log(player);
console.log('--------------------------');
console.log(initPlayer);
console.log('--------------------------');
console.log(playPlayer);

