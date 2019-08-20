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

class ActionString {
    constructor(street, player, balance, action, pot, amount, position, invest) {
        this.street = street;
        this.player = player;
        this.balance = balance;
        this.action = action;
        this.pot = pot;
        this.amount = amount;
        this.position = position;
        this.invest = invest;
    }
};

const rawActionList = [];
rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 0); // post BB  -30
rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 8);       // bet 0.75 BTN   -55
rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 0);   // call BB
rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8);       // bet 0.75 BTN   -55
//

// PokerEngine.PushHintMove(setupID, invest, position, action);
class Move {
    constructor(invest, enumPosition, action, street, board) {
        this.invest = invest;
        this.enumPosition = enumPosition;
        this.action = action;
        this.street = street;
        this.board = board;
    }
}

class PlaySetup {
    constructor(playFrame) {            // frame from recognition -> validator.dll -> playFrame
        this.initPlayers = [];
        this.positionMap = {};
        this.handNumber = -1;
        this.bbSize = [];           // chronology of bb sizes
        this.moves = [];
        this.rawActionList = [];
        this.playFrames = [];
        this.rejectHand = false;

        this.frameHandler(playFrame);
    }

    // PokerEngine.PushHintMove(setupID, invest, position, action);
    frameHandler(playFrame) {
        console.log('playFrame prompterHandler');
        console.log(playFrame);
        if (this.rejectHand && playFrame.handNumber === this.handNumber) {
            return REJECT_HAND;
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
                return REJECT_HAND;
            }
            this.setInitPlayers(playFrame);
            this.setPositionsMap();
        }

        this.getMovesFromFrame(playFrame);
        if (this.rejectHand) {
            return REJECT_HAND;
        }
    };

    // let testPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.preflop[i].position, i < 2 ? 0 : request.actions.preflop[i].action);


    // frame1 = new PlayFrame(12345, 35, playPlayers, [], true);
    // playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, true,'');
    getMovesFromFrame(playFrame) {
        if (this.moves.length === 0) {        // first frame
            const BBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].betAmount;

            if (this.bbSize.length && BBAmount > this.bbSize[this.bbSize.length - 1] * 2.5) {   // wrong BB recognition or reraise
                this.rejectHand = true;
                return false;
            } else if (this.bbSize.length > 2) {
                this.bbSize.shift();
            }
            this.bbSize.push(BBAmount);
            if (this.rejectHand) {
                return false;
            }

            const SBSize = Math.floor(BBAmount / 2);
            const BTNAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BTN')]].betAmount;

            // posts
            if (this.initPlayers.length === 2) {        // ha
                this.moves.push(new Move(BTNAmount >= BBAmount ? SBSize : BTNAmount, enumPoker.positions.indexOf('BTN'), 0, 0));       // post SB
                this.moves.push(new Move(BBAmount, enumPoker.positions.indexOf('BB'), 0, 0));      // post BB
            } else {
                const SBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('SB')]].betAmount;

                this.moves.push(new Move(SBAmount >= BBAmount ? SBSize : SBAmount, enumPoker.positions.indexOf('SB'), 0, 0));   // post SB
                this.moves.push(new Move(BBAmount, enumPoker.positions.indexOf('BB'), 0, 0));      // post BB
            }
        }

        // not first frame
        // от последнего запушенного мува не включительно, начинаем ходить по часовой стрелке

        // this.moves.push(new Move(undefined, undefined, undefined, ['Ac']));      // push board

        if (!this.moves[this.moves.length - 1].board) {     // not first frame at new postflop street

            console.log('yo');
        }
    }

    getPot() {
        return this.moves.reduce((sum, current) => sum + current.invest, 0);
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
                this.initPlayers[player.recognitionPosition] = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(player.isDealer ? 'BTN' : 'BB'));
            });
        } else if (playersWasActive.length === 3) {     // spins or other 3 max
            console.log('3 players!');

            let pXDealer;
            playersWasActive.forEach(player => {
                if (player.isDealer) {
                    pXDealer = pXD[player.recognitionPosition];
                }
            });
            playersWasActive.forEach(player => {
                this.initPlayers[player.recognitionPosition] = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(pXDealer[player.recognitionPosition]));
            });
        }
        console.log('setInitPlayers: this.initPlayers');
        console.log(this.initPlayers);
    }

    setPositionsMap() {
        this.initPlayers.forEach((initPlayer, index) => {
            this.positionEnumKeyMap[initPlayer.enumPosition] = index;
        });
        console.log('this.positionEnumKeyMap');
        console.log(this.positionEnumKeyMap);
    }

    getFirstEnumPositionToMove(isPreflop) {
        return isPreflop ? Math.max(0, (this.initPlayers.length - 3)) : (this.initPlayers.length === 2 ? 8 : 9);
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
    const bbSize = 50;

    return bbSize;
};

const prompterListener = (setup, request) => {
    console.log('enter prompter listener');
    const prompt =
        `<div class="main-container spins party-poker">
        <div class="player player0">
            <div class="nickname green">Joe <span class="balance">/ 23bb</span></div>
            <div>
                <span class="stat green">VPIP: 54, </span><span class="stat">PFR: 19, </span><span class="stat">3Bet: 13</span>
            </div>
            <div>
                <span class="stat">CBet: 45, </span><span class="stat green">Raise%: 9, </span><span class="stat">Call%: 55</span>
            </div>
            <div class="dealer"><span>D</span></div>
            <div class="amount bet-raise">bet: 5bb</div>
        </div>
        <div class="player player1">
            <div class="nickname red">checkmate <span class="balance">/ 16bb</span></div>
            <div>
                <span class="stat red">VPIP: 17, </span><span class="stat">PFR: 16, </span><span class="stat">3Bet: 20</span>
            </div>
            <div>
                <span class="stat">CBet: 65, </span><span class="stat red">Raise%: 25, </span><span class="stat">Call%: 42</span>
            </div>
            <div class="amount check-call">check</div>
        </div>
        <div class="player player2">
            <div class="nickname">See my luck <span class="balance">/ 27bb</span></div>
            <div>
                <span class="stat">VPIP: 30, </span><span class="stat">PFR: 23, </span><span class="stat">3Bet: 15</span>
            </div>
            <div>
                <span class="stat">CBet: 55, </span><span class="stat">Raise%: 12, </span><span class="stat">Call%: 40</span>
            </div>
        </div>
        <div class="board">
            <div class="pot">Pot: 10bb</div>
            <div class="card spades">
                <div class="value">A</div>
                <div class="suit">&#9824</div>
            </div>
            <div class="card clubs">
                <div class="value">8</div>
                <div class="suit">&#9827</div>
            </div>
            <div class="card hearts">
                <div class="value">T</div>
                <div class="suit">&#9829</div>
            </div>
            <div class="card diamonds">
                <div class="value">Q</div>
                <div class="suit">&#9830</div>
            </div>
            <div class="card diamonds">
                <div class="value">2</div>
                <div class="suit">&#9830</div>
            </div>
        </div>
        <div class="hero-hand">
            <div class="card diamonds">
                <div class="value">T</div>
                <div class="suit">&#9830</div>
            </div>
            <div class="card spades">
                <div class="value">T</div>
                <div class="suit">&#9824</div>
            </div>
        </div>
        <div class="prompt">
            <div class="bet-raise red">
                Raise: 25bb
            </div>
            <div class="diagram">
                <div class="fold" style="width: 10%"></div>
                <div class="check-call" style="width: 35%"></div>
                <div class="bet-raise" style="width: 55%"></div>
            </div>
            <div class="sizings">
                <table>
                    <tr style="opacity: 0.25">
                        <td class="check-call">Call</td>
                        <td class="ev">EV: 5bb</td>
                    </tr>
                    <tr style="opacity: 0.3">
                        <td class="bet-raise">Raise: 1pot</td>
                        <td class="ev">EV: 10bb</td>
                    </tr>
                    <tr style="opacity: 0.5">
                        <td class="bet-raise">Raise: 1.6pot</td>
                        <td class="ev">EV: 13bb</td>
                    </tr>
                    <tr>
                        <td class="bet-raise">Raise: 2.5pot</td>
                        <td class="ev">EV: 15bb</td>
                    </tr>
                    <tr style="opacity: 0.7">
                        <td class="bet-raise">All-in</td>
                        <td class="ev">EV: 14bb</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>`;

    const id = request.data.id;
    const promptData = {
        prompt,
        id,
    };

    request.client.emit('prompt', promptData);
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

}

// test ha old rawActionList for example
rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 0, false, false); // post BB  -30
rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 8, false, false);       // bet 0.75 BTN   -55
rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 0, false, false);   // call BB
rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8, false, false);

// test ha
// let initPlayers = [];
const playPlayers = [];

// export const positions = ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"];
playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, true,'');
playPlayers[1] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');
playPlayers[2] = new PlayPlayer('joooe84', 2, 475, 25, true, false,'AcAd');


// playPlayers[0] = new PlayPlayer('checkmateN1', 2, 715, 10, true, true,'');
// playPlayers[1] = new PlayPlayer('joooe84', 0, 475, 25, true, false,'AcAd');
// playPlayers[2] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');

const frame1 = new PlayFrame(12345, 35, playPlayers, [], true);
// console.log(frame1);
// console.log(enumPoker.positions[0]);

const testSetup = new PlaySetup(frame1);



module.exports.prompterListener = prompterListener;
module.exports.getBBsize = getBBsize;



