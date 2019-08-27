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
    constructor(handNumber, pot, playPlayers, board, isButtons, heroRecPosition) {
        this.handNumber = handNumber;
        this.pot = pot;
        this.playPlayers = playPlayers;
        this.board = board;         // []
        this.isButtons = isButtons;
        this.heroRecPosition = heroRecPosition;       // 2 for spin&go
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

// let rawActionList = [];
// rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 0);
// rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 8);
// rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 0);
// rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8);
// //

// PokerEngine.PushHintMove(setupID, invest, position, action);
// class Move {
//     constructor(invest, enumPosition, action, street, board) {
//         this.invest = invest;
//         this.enumPosition = enumPosition;
//         this.action = action;
//         this.street = street;
//         this.board = board;
//     }
// }

class PlaySetup {
    constructor(playFrame) {            // frame from recognition -> validator.dll -> playFrame
        this.initPlayers = [];      // all players who was active in start. Index === recPosition, some indexes == undefined!
        this.playersWasActive = [];   // all players who was active in start without empty chairs or waiting players
        this.positionEnumKeyMap = {};
        this.handNumber = -1;
        this.bbSize = [];           // chronology of bb sizes
        this.rawActionList = [];
        this.board = [];
        this.playFrames = [];
        this.rejectHand = false;

        this.frameHandler(playFrame);
    }

    // PokerEngine.PushHintMove(setupID, invest, position, action);
    frameHandler(playFrame) {
        // console.log('playFrame prompterHandler');
        // console.log(playFrame);
        if (this.rejectHand && playFrame.handNumber === this.handNumber) {
            return REJECT_HAND;
        }
        if (playFrame.handNumber !== this.handNumber) {         // new hand
            this.handNumber = playFrame.handNumber;
            this.initPlayers = [];
            this.positionEnumKeyMap = {};
            this.rawActionList = [];
            this.playersWasActive = [];
            this.playFrames = [];
            this.board = [];
            this.rejectHand = false;

            if (playFrame.board.length) {           // reject new hand with board cards
                this.rejectHand = true;
                return REJECT_HAND;
            }
            this.setInitPlayers(playFrame);
            this.setPositionsMap();
            if (this.rejectHand) {
                return REJECT_HAND;     // something wrong with first frame
            }
        }
        if (this.rejectHand) {
            return REJECT_HAND;
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
        if (this.rawActionList.length === 0) {        // first frame
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
            // constructor(street, player, balance, action, pot, amount, position, invest)
            if (this.playersWasActive.length === 2) {        // ha
                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BTN')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BTN')]].initBalance,
                    0,
                    0,
                    BTNAmount >= BBAmount ? SBSize : BTNAmount,
                    enumPoker.positions.indexOf('BTN'),
                    BTNAmount >= BBAmount ? SBSize : BTNAmount));       // post SB

                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].initBalance,
                    0,
                    BTNAmount >= BBAmount ? SBSize : BTNAmount,
                    BBAmount,
                    enumPoker.positions.indexOf('BB'),
                    BBAmount));      // post BB
            } else {
                const SBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('SB')]].betAmount;

                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('SB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('SB')]].initBalance,
                    0,
                    0,
                    SBAmount >= BBAmount ? SBSize : SBAmount,
                    enumPoker.positions.indexOf('SB'),
                    SBAmount >= BBAmount ? SBSize : SBAmount));   // post SB

                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.positions.indexOf('BB')]].initBalance,
                    0,
                    SBAmount >= BBAmount ? SBSize : SBAmount,
                    BBAmount,
                    enumPoker.positions.indexOf('BB'),
                    BBAmount));      // post BB
            }
        }

        // not first frame
        // от последнего запушенного мува не включительно, начинаем ходить по часовой стрелке до chairTo
        // constructor(street, player, balance, action, pot, amount, position, invest)

        const lastRecPosition = this.positionEnumKeyMap[this.rawActionList[this.rawActionList.length - 1].position];
        let chairTo;        // стул до которого нам нужно идти в цикле по часовой стрелке, включительно - тот, который точно изменил состояние!

        console.log('lastRecPosition');
        console.log(lastRecPosition);
        console.log('///////////////////////');

        if (!this.isTerminalStreetState()) {        // еще нужно добавлять мувы на эту улицу + на этой улице есть какие-то мувы
            const curStreet = this.rawActionList[this.rawActionList.length - 1].street;

            // если количество запушенных мувов на этой улице больше 0 - делаем то, что делали..
            // если === 0, то выставляем lastRecPosition = getFirstEnumPositionToMove, и стандартно
            // если не 0 И ход хиро ИЛИ вырос пот по сравнению с запушенными
            // определяем чайрТу

            if (playFrame.board.length === this.board.length) {             // нету перехода улицы
                console.log('no changing street');
                // if (playFrame.isButtons) {
                //     chairTo = this.getRecPositionBefore(this.initPlayers.length, playFrame.heroRecPosition);        // 2 for spin&go
                //     console.log(`see buttons - hero's turn. ChairTo: ${chairTo}`);
                // } else {
                //
                // }
                // const chairFromForReversList = playFrame.isButtons ? this.getRecPositionBefore(this.initPlayers.length, playFrame.heroRecPosition) : lastRecPosition;
                this.getReversListOrder(this.initPlayers.length, lastRecPosition).forEach(chair => {
                    console.log(`chair: ${chair}`);
                    // played
                    if (chairTo === undefined && this.initPlayers[chair] !== undefined) {
                        console.log(`player with recPosition ${chair} played`);
                        if (!playFrame.playPlayers[chair].isActive) {
                            // check on fold
                            if (!this.wasFoldBefore(chair)) {     // folded in first time
                                chairTo = chair;
                            }
                        } else {
                            console.log(`chair ${chair} check on wasAnyMove`);
                            if (!this.wasAnyMoveBefore(chair)) {     // no moves before but steel isActive
                                console.log(`chair ${chair} no moved before`);
                                // вложил деньги
                                if (playFrame.playPlayers[chair].betAmount > 0) {
                                    console.log(`chair ${chair} invest money and he will be set as chairTo`);
                                    chairTo = chair;
                                }
                            } else {
                                for (let i = this.rawActionList.length - 1; i >= 0; i--) { // кто сфолдил или баланс = 0
                                    if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                                        if (this.rawActionList[i].balance - this.rawActionList[i].amount !== playFrame.playPlayers[chair].curBalance) {     // если не совпал баланс
                                            chairTo = chair;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                console.log(`chairTo: ${chairTo}`);

            } else {        // есть переход улицы
                let potBefore = playFrame.playPlayers.reduce();
                // возвращаем все амаунты в балансы игроков и смотрим предыдущую улицу - чтобы сошелся пот если все поколят до терминального состояния.
                // Если не сойдется пот - значит вероятно первый следующий за запушенными мувами игрок зарейзил - тот у кого изменился баланс относительно
                // баланса если бы все просто поколили макс ставку.
            }

            if (chairTo !== undefined) {        // есть игрок с измененным состоянием
                // запускаем цикл от последнего игрока в rawActionList до chairTo игрока и пытаемся вычислить какой тип мува и сколько вложил каждый игрок
                this.movesOrder(this.initPlayers.length, lastRecPosition, chairTo).forEach(chair => {
                    // если был бет на этой улице - записываем действие рейз.

                });
            } else {
                console.log(`players did't change their states. Waiting for next frame`);
            }

        } else {        // ждем борда или кнопок хиро или чайрТу, вложившего деньги
            if (playFrame.board.length === this.board.length) {             // нету перехода улицы

            } else {        // появилась новая карта борда и возможно мувы

            }
        }
    }

    getMovesCount(street) {
        return this.rawActionList.filter(action => action.street === street).length;
    }

    wasAnyMoveBefore(playerRecPosition) {
        return !!this.rawActionList.filter(action => this.initPlayers[playerRecPosition].enumPosition === action.position).length;
    }

    wasFoldBefore(playerRecPosition) {
        // if (this.initPlayers[playerRecPosition] === undefined) {
        //     return true;
        // }
        return !!this.rawActionList.filter(action => this.initPlayers[playerRecPosition].enumPosition === action.position && action.action === 5).length;
    }

    maxAmountAtCurrentStreet() {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 2; i > 0; i--) {
            if (this.rawActionList[i].street === currentStreet) {
                if (this.rawActionList[i].action < 3) {
                    return +this.rawActionList[i].amount;
                }
            } else {
                return 0;
            }
        }
        return +this.rawActionList[1].amount;       // BB
    }

    whoIsInGame() {
        const playersInGame = []; //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд
        const blackList = [];
        const allPlayers = [];
        for (let i = this.rawActionList.length - 1; i >= 0; i--) { //добавляем всех кто сфолдил или баланс = 0
            if (Math.abs(this.initPlayerBalance(this.rawActionList[i].position, this.rawActionList.length - 1) - this.rawActionList[i].amount) < 1 || this.rawActionList[i].action === 5) {
                blackList.push(this.rawActionList[i].position);
            }
        }

        for (let i = this.rawActionList.length - 1; i >= 0; i--) { // добавляем всех игроков
            if (allPlayers.indexOf(this.rawActionList[i].position) < 0) {
                allPlayers.push(this.rawActionList[i].position);
            }
        }
        for (let i = allPlayers.length - 1; i >= 0; i--) { // добавляем только тех кто остался
            if (blackList.indexOf(allPlayers[i]) < 0) {
                playersInGame.push(allPlayers[i]);
            }
        }
        return playersInGame;
    }

    // инициальный баланс на текущей улице
    initPlayerBalance(position, oldActionListLength) {
        let currentStreetForBalance;
        let lastPlayerAmount;
        let initBalance;
        for (let i = oldActionListLength - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === position) {
                currentStreetForBalance = this.rawActionList[i].street;
                lastPlayerAmount = this.rawActionList[i].amount;
                initBalance = this.rawActionList[i].balance;
                break;
            }
        }

        for (let i = oldActionListLength - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === position) {
                if (this.rawActionList[i].street === currentStreetForBalance) {
                    initBalance = this.rawActionList[i].balance;
                } else {return initBalance;}
            }
        }
        return initBalance; // если улица префлоп
    }

    isTerminalStreetState() {
        const currentAmount = this.maxAmountAtCurrentStreet();
        const nPlayers = this.whoIsInGame().slice();

        if (nPlayers.length <= 1 && this.rawActionList[this.rawActionList.length - 1].action >= 3 && this.whoIsInGame() === this.rawActionList[this.rawActionList.length - 1].position) {
            return true;
        }

        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        if (this.rawActionList[this.rawActionList.length - 1].action < 3) {return false;}

        for (let i = this.rawActionList.length - 1; i > 0; i--) {
            if (nPlayers.indexOf(this.rawActionList[i].position) >= 0) { // если среди играющих есть такой игрок
                if (this.rawActionList[i].amount === currentAmount && this.rawActionList[i].street === currentStreet) { // проверяем совпадает ли значение его ставки и улица
                    nPlayers.splice(nPlayers.indexOf(this.rawActionList[i].position), 1); // удаляем игрока с совпавшей позицией
                    if (nPlayers.length === 0) {
                        return true;
                    }
                } else {return false;}
            }
        }
    }

    getPot() {
        return this.rawActionList.reduce((sum, current) => sum + current.invest, 0);
    }

    wasBet(street) {

    }

    wasRaise() {

    }

    setInitPlayers(firstPlayFrame) {
        this.playersWasActive = firstPlayFrame.playPlayers.filter(player => (player.isActive || (!player.isActive && player.curBalance > 1)));

        const p0Dealer = ['BTN', 'SB', 'BB'];
        const p1Dealer = ['BB', 'BTN', 'SB'];
        const p2Dealer = ['SB', 'BB', 'BTN'];
        const pXD = [p0Dealer, p1Dealer, p2Dealer];

        console.log('this.playersWasActive');
        console.log(this.playersWasActive);

        if (this.playersWasActive === 2) {    // ha
            console.log('2 players!');

            this.playersWasActive.forEach(player => {
                this.initPlayers[player.recognitionPosition] = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(player.isDealer ? 'BTN' : 'BB'));
            });
        } else if (this.playersWasActive.length === 3) {     // spins or other 3 max
            console.log('3 players!');

            let pXDealer;
            this.playersWasActive.forEach(player => {
                if (player.isDealer) {
                    pXDealer = pXD[player.recognitionPosition];
                }
            });
            this.playersWasActive.forEach(player => {
                this.initPlayers[player.recognitionPosition] = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.positions.indexOf(pXDealer[player.recognitionPosition]));
            });
        }
        console.log('setInitPlayers: this.initPlayers');
        console.log(this.initPlayers);
        if (!this.initPlayers.length) {
            this.rejectHand = true;
        }
    }

    setPositionsMap() {
        console.log('this.playersWasActive');
        console.log(this.playersWasActive);
        this.initPlayers.forEach((initPlayer, index) => {
            if (initPlayer !== undefined) {
                this.positionEnumKeyMap[initPlayer.enumPosition] = index;
            }
        });
        console.log('this.positionEnumKeyMap');
        console.log(this.positionEnumKeyMap);
    }

    getFirstEnumPositionToMove(isPreflop) {
        return isPreflop ? Math.max(0, (this.playersWasActive.length - 3)) : (this.playersWasActive.length === 2 ? 8 : 9);
    }

    // movesOrder(numChairs, chairFrom, chairTo) {
    //     for(let ch = chairFrom; ch%numChairs !== chairTo; ch++) {
    //         console.log(ch%numChairs);
    //     }
    // }

    movesOrder(numChairs, chairFrom, chairTo) {
        const arr = [];
        for(let i = 1; i <= numChairs; i++) {
            arr.push((chairFrom + i)%numChairs);
            if ((chairFrom + i)%numChairs === chairTo) {
                break;
            }
        }
        return arr;
    }

    // getRecPositionBefore(numChairs, chairFrom) {
    //     return (chairFrom + numChairs - 1)%numChairs;
    // }

    getReversListOrder(numChairs, chairFrom) {
        const arr = [];
        for(let i = numChairs; i > 0; i--) {
            arr.push((chairFrom + i)%numChairs);
        }
        return arr;
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


// test ha old rawActionList for example
// rawActionList[0] = new ActionString(0, "checkmateN1", 7.25, 3, 0, 0.1, 0, false, false); // post BB  -30
// rawActionList[1] = new ActionString(0, "joooe84", 5, 1, 0.1, 0.25, 8, false, false);       // bet 0.75 BTN   -55
// rawActionList[2] = new ActionString(0, "checkmateN1", 7.15, 2, 0.35, 0.75, 0, false, false);   // call BB
// rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8, false, false);

// test ha
// let initPlayers = [];
const playPlayers = [];

// export const positions = ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"];
// !!!!!!! indexes of playPlayers === recognitionPosition !!!!!!!!
playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, false,'');
playPlayers[1] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');
playPlayers[2] = new PlayPlayer('joooe84', 2, 475, 25, true, true,'AcAd');

const frame1 = new PlayFrame(12345, 60, playPlayers, [], true, 2);

const testSetup = new PlaySetup(frame1);



module.exports.prompterListener = prompterListener;


