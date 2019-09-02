const moment = require('moment');

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
    constructor(handNumber, pot, playPlayers, board, isButtons, heroRecPosition, testNumber) {
        this.handNumber = handNumber;
        this.pot = pot;
        this.playPlayers = playPlayers;
        this.board = board;         // []
        this.isButtons = isButtons;
        this.heroRecPosition = heroRecPosition;       // 2 for spin&go
        this.testNumber = testNumber;
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
        this.rejectHand = false;
        this.prevPlayFrame = null;
        this.prevPlayFrameTime = null;
        this.lastPromptMoveType = null; // используем для эвристики по поводу того, кто именно ставил, когда это не известно.

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
            this.board = [];
            this.prevPlayFrame = null;
            this.prevPlayFrameTime = null;
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
        this.prevPlayFrame = playFrame;
        this.prevPlayFrameTime = moment().format('h:mm:ss');
    };

    // let testPush = PokerEngine.PushHintMove(newSetupID, curInvest, request.actions.preflop[i].position, i < 2 ? 0 : request.actions.preflop[i].action);


    // frame1 = new PlayFrame(12345, 35, playPlayers, [], true);
    // playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, true,'');
    getMovesFromFrame(playFrame) {
        // first frame
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
        ///////////////////////////////////////////////////////
        // not first frame
        // от последнего запушенного мува не включительно, начинаем ходить по часовой стрелке до chairTo
        // constructor(street, player, balance, action, pot, amount, position, invest)
        let chairTo;        // стул до которого нам нужно идти в цикле по часовой стрелке, включительно - тот, который точно изменил состояние!

        if (!this.isTerminalStreetState()) {        // еще нужно добавлять мувы на эту улицу + на этой улице есть какие-то мувы!
            const lastRecPosition = this.positionEnumKeyMap[this.rawActionList[this.rawActionList.length - 1].position];
            console.log('lastRecPosition');
            console.log(lastRecPosition);
            console.log('///////////////////////');
            const curStreet = this.rawActionList[this.rawActionList.length - 1].street;

            if (playFrame.board.length === this.board.length) {             // нету перехода улицы
                console.log('no changing street');

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
                            if (!this.wasAnyMoveBeforeOnCurStreet(chair)) {     // no moves before but steel isActive
                                console.log(`chair ${chair} no moved before`);
                                // вложил деньги
                                if (playFrame.playPlayers[chair].betAmount > 0) {
                                    console.log(`chair ${chair} invest money and he will be set as chairTo`);
                                    chairTo = chair;
                                }
                            } else {
                                for (let i = this.rawActionList.length - 1; i >= 0; i--) { // кто сфолдил или баланс = 0
                                    if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                                        if (this.rawActionList[i].balance - this.rawActionList[i].invest !== playFrame.playPlayers[chair].curBalance) {     // если не совпал баланс
                                            chairTo = chair;
                                            break;
                                        } else {
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                console.log(`chairTo: ${chairTo}`);

            } else {        // !!! есть переход улицы и на предыдущей улице все еще нужно пушить мувы

                const potTerminal = playFrame.playPlayers.reduce((sum, player) => sum - player.amount, playFrame.pot);  // пот в терминальном состоянии пред улицы
                console.log(`New street and need to fill previous. New pot: ${playFrame.pot}.Pot before new street: ${potTerminal}`);

                // проверяем пот если все вколят макс ставку на пред улице на равенство с potTerminal
                // const maxAmount = this.maxAmountAtCurrentStreet();

                // ходим по кругу от игрока с макс амаунтом и за всех колим умную разницу между амаунтом игрока и макс амаунтом
                const chairWithMaxAmount = this.getRecChairWithMaxAmount();
                const maxAmount = this.maxAmountAtCurrentStreet();
                const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
                let potIfAllCallFold;
                let potIfAllCallFoldHeroRaise;

                if (maxAmount) {  // was bet+
                    potIfAllCallFold = this.movesOrder(this.initPlayers, chairWithMaxAmount, this.getRecPositionBefore(this.initPlayers.length, chairWithMaxAmount)).reduce((pot, chair) => {
                        if (this.initPlayers[chair] !== undefined) {
                            for (let i = this.rawActionList.length - 1; i >= 0; i--) {
                                if (currentStreet === this.rawActionList[i].street) {
                                    if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position) {
                                        if (this.rawActionList[i].action === 5) {     // was fold and could't invest
                                            return pot;
                                        }

                                // если не уменьшился баланс относительно запушенного И амаунт меньше макс амаунта И баланс > 0 - то игрок сфолдил здесь
                                        if (this.rawActionList[i].balance + this.rawActionList[i].invest === playFrame.playPlayers[chair].curBalance
                                            && this.rawActionList[i].amount < maxAmount
                                            && this.rawActionList[i].balance - this.rawActionList[i].invest > 0) {     // fold here
                                            return pot;
                                        }
                                        const smartRestBalance = this.rawActionList[i].balance - this.rawActionList[i].invest;
                                        const amountsDiff = maxAmount - this.rawActionList[i].amount;
                                        return pot + Math.min(smartRestBalance, amountsDiff);
                                    }
                                } else {    // не ходил на этой улице
                                    if (!this.wasFoldBefore(chair)) {
                                        const balance = this.initPlayerBalance(this.initPlayers[chair].enumPosition);
                                        return pot + Math.min(balance, maxAmount);
                                    }
                                    return pot;
                                }
                            }
                        } else {
                            return pot;
                        }
                    }, this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest);
                } else {        // was't bet+
                    potIfAllCallFold = this.rawActionList[this.rawActionList.length - 1].pot;
                }
                console.log('potIfAllCallFold');
                console.log(potIfAllCallFold);

                if (potIfAllCallFold === potTerminal) {
                    // coздаем фрейм где все или чекают или колят или фолдят в зависимости от chairWithMaxAmount >= 0
                } else if (potTerminal > potIfAllCallFold) {  // был рейз! не бет
                    // пытаемся предположить кто.. если не очевидно кто - отменяем подсказывания для этой раздачи
                    const isClearAllBalances = playFrame.playPlayers.reduce((isNumber, player) => isNumber && !isNaN(player.curBalance), true);
                    let fantomRawActionsCount = 0;  // количество предполагаемых строк, которые мы пушим в this.rawActions, которые можем откатить в случае неверных предположений

                    if (this.prevPlayFrame.isButtons) {
                        const now = moment().format('h:mm:ss');
                        const ms = moment(now,'h:mm:ss').diff(moment(this.prevPlayFrameTime,'h:mm:ss'));
                        if (ms < 3500) {    // предполагаем, что повышал хиро, а его оппоненты быстро колили/фолдили
                            // определяем размер повышения хиро относительно maxAmount
                            // if (!isNaN(playFrame.playPlayers[playFrame.heroRecPosition].curBalance)) {      // видим баланс
                            if (isClearAllBalances) {      // видим балансы
                                // проверяем - максимальный ли амаунт был именно у хиро, тоесть сойдется ли пот

                                const heroStartBalance = this.initPlayerBalance(this.positionEnumKeyMap[playFrame.heroRecPosition]);
                                const heroAmount = playFrame.playPlayers[playFrame.heroRecPosition].curBalance - playFrame.playPlayers[playFrame.heroRecPosition].betAmount;

                                const heroMaxAmount = heroAmount - heroStartBalance;
                                let passHero = false;
                                let potIfAllCallFoldHero;

                                // доколиваем/фолдим за остальных игроков так, чтоб сошелся пот
                                this.movesOrder(this.initPlayers, chairWithMaxAmount, this.getRecPositionBefore(this.initPlayers.length, chairWithMaxAmount)).reduce((pot, chair) => {
                                    if (!passHero && this.initPlayers[chair] !== undefined) {
                                        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
                                            if (currentStreet === this.rawActionList[i].street) {
                                                if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position) {
                                                    if (this.rawActionList[i].action === 5) {     // was fold and could't invest
                                                        return pot;
                                                    }

                                                    // если не уменьшился баланс относительно запушенного И амаунт меньше макс амаунта И баланс > 0 - то игрок сфолдил здесь
                                                    if (this.rawActionList[i].balance + this.rawActionList[i].invest === playFrame.playPlayers[chair].curBalance
                                                        && this.rawActionList[i].amount < maxAmount
                                                        && this.rawActionList[i].balance - this.rawActionList[i].invest > 0) {     // fold here

                                                        this.rawActionList.push(new ActionString(
                                                            currentStreet,
                                                            this.initPlayers[chair].player,
                                                            this.rawActionList[i].balance + this.rawActionList[i].invest,
                                                            enumPoker.actionsType.indexOf('fold'),
                                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                            0,
                                                            this.initPlayers[chair].enumPosition,
                                                            0));

                                                        fantomRawActionsCount++;
                                                        return pot;
                                                    }
                                                    const smartRestBalance = this.rawActionList[i].balance - this.rawActionList[i].invest;
                                                    const amountsDiff = maxAmount - this.rawActionList[i].amount;
                                                    // проверяем на хиро
                                                    if (playFrame.heroRecPosition === chair) {
                                                        // бетим/рейзим, записываем в сырые действия ход хиро и запускаем новый цикл колл/фолда вокруг хиро

                                                        this.rawActionList.push(new ActionString(
                                                            curStreet,
                                                            this.initPlayers[chair].player,
                                                            this.rawActionList[i].balance + this.rawActionList[i].invest,
                                                            enumPoker.actionsType.indexOf('raise'),
                                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                            heroMaxAmount,
                                                            this.initPlayers[chair].enumPosition,
                                                            heroMaxAmount - this.rawActionList[i].amount));
                                                        fantomRawActionsCount++;
                                                        potIfAllCallFoldHeroRaise = 1;
                                                        passHero = true;
                                                    }

                                                    return pot + Math.min(smartRestBalance, amountsDiff);
                                                }
                                            } else {    // не ходил на этой улице
                                                if (!this.wasFoldBefore(chair)) {
                                                    const balance = this.initPlayerBalance(this.initPlayers[chair].enumPosition);
                                                    return pot + Math.min(balance, maxAmount);
                                                }
                                                return pot;
                                            }
                                        }
                                    } else {
                                        return pot;
                                    }
                                }, this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest);

                            }
                        } else {
                            // пытаемся определить по стеку - кто повышал, если у кого-то стек меньше чем амаунт необходимый для повышения
                        }
                    }
                }

            }

            if (chairTo !== undefined) {        // есть игрок с измененным состоянием
                // запускаем цикл от последнего игрока в rawActionList до chairTo игрока и пытаемся вычислить какой тип мува и сколько вложил каждый игрок
                // в этом состоянии всегда есть запушенные мувы(хотя бы 1) на этой улице, поэтому всегда есть lastRecPosition
                this.movesOrder(this.initPlayers.length, lastRecPosition, chairTo).forEach(chair => {
                    if (this.initPlayers[chair] !== undefined) {
                        if (!playFrame.playPlayers[chair].isActive) {
                            // check on fold
                            if (!this.wasFoldBefore(chair)) {     // folded in first time
                                this.rawActionList.push(new ActionString(
                                    curStreet,
                                    this.initPlayers[chair].player,
                                    playFrame.playPlayers[chair].curBalance,
                                    enumPoker.actionsType.indexOf('fold'),
                                    this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                    0,
                                    this.initPlayers[chair].enumPosition,
                                    0));
                            }
                        } else {
                            // если был бет на этой улице - записываем агро действие рейз.
                            const prevBetAmount = this.wasBet(this.rawActionList.length - 1);
                            if (prevBetAmount) {    // was bet or raise
                                const prevAmount = this.getPrevAmountOnCurStreet(chair);
                                console.log(`chair ${chair} prevAmount: ${prevAmount}`);
                                if (prevBetAmount < playFrame.playPlayers[chair].betAmount) {       // raise
                                    this.rawActionList.push(new ActionString(
                                        curStreet,
                                        this.initPlayers[chair].player,
                                        playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount - prevAmount,
                                        enumPoker.actionsType.indexOf('raise'),
                                        this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                        playFrame.playPlayers[chair].betAmount,
                                        this.initPlayers[chair].enumPosition,
                                        playFrame.playPlayers[chair].betAmount - prevAmount));
                                } else if (prevBetAmount === playFrame.playPlayers[chair].betAmount) {      // call
                                    this.rawActionList.push(new ActionString(
                                        curStreet,
                                        this.initPlayers[chair].player,
                                        playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount - prevAmount,
                                        enumPoker.actionsType.indexOf('call'),
                                        this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                        playFrame.playPlayers[chair].betAmount,
                                        this.initPlayers[chair].enumPosition,
                                        playFrame.playPlayers[chair].betAmount - prevAmount));
                                }
                            } else {    // bet or check
                                this.rawActionList.push(new ActionString(
                                    curStreet,
                                    this.initPlayers[chair].player,
                                    playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount,
                                    enumPoker.actionsType.indexOf(playFrame.playPlayers[chair].betAmount ? 'bet' : 'check'),
                                    this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                    playFrame.playPlayers[chair].betAmount,
                                    this.initPlayers[chair].enumPosition,
                                    playFrame.playPlayers[chair].betAmount));
                            }
                        }
                    }
                });
                console.log(this.rawActionList);
            } else {
                console.log(`players did't change their states. Waiting for next frame`);
            }

        } else {        // !!терминальное состояние!! ждем борда или кнопок хиро или чайрТу, вложившего деньги, или распознаем шоудауны
            console.log('!!!terminal state');
            if (playFrame.board.length === 5 && this.rawActionList[this.rawActionList.length - 1].street === 3) {   // терминальное на ривере
                // ждем и собираем шоудауны.. формируем историю руки с победами
            } else if (playFrame.board.length === this.board.length) {             // нету нового борда
                // waiting new bord card
            } else {        // появилась новая карта борда и возможно мувы

            }
        }
    }

    isSomeOfTextMoves(balanceRecognition) {
        return !!enumPoker.actionsType.filter(moveType => moveType === balanceRecognition.toLowerCase()).length;
    }

    getMovesCount(street) {
        return this.rawActionList.filter(action => action.street === street).length;
    }

    wasAnyMoveBeforeOnCurStreet(playerRecPosition) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        return !!this.rawActionList.filter(action => this.initPlayers[playerRecPosition].enumPosition === action.position && action.street === currentStreet).length;
    }

    getPrevAmountOnCurStreet(playerRecPosition) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (currentStreet === this.rawActionList[i].street) {
                if (this.initPlayers[playerRecPosition].enumPosition === this.rawActionList[i].position) {
                    console.log(this.rawActionList[i].amount);
                }
                if (this.initPlayers[playerRecPosition].enumPosition === this.rawActionList[i].position) {
                    return this.rawActionList[i].amount;
                }
            } else {
                return 0;
            }
        }
        return 0;
    }

    wasFoldBefore(playerRecPosition) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[playerRecPosition].enumPosition) {
                return this.rawActionList[i].action === 5;  // fold
            }
        }
        return false;
    }

    maxAmountAtCurrentStreet() {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i > 0; i--) {
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

    getRecChairWithMaxAmount() {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i > 0; i--) {
            if (this.rawActionList[i].street === currentStreet) {
                if (this.rawActionList[i].action < 3) {
                    return this.positionEnumKeyMap[this.rawActionList[i].position];
                }
            } else {
                return -1;
            }
        }
        return this.positionEnumKeyMap[this.rawActionList[1].position];       // BB
    }

    whoIsInGame() {
        const playersInGame = []; //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд
        const blackList = [];
        const allPlayers = [];
        for (let i = this.rawActionList.length - 1; i >= 0; i--) { //добавляем всех кто сфолдил или баланс = 0
            if (Math.abs(this.initPlayerBalance(this.rawActionList[i].position) - this.rawActionList[i].amount) < 1 || this.rawActionList[i].action === 5) {
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
    initPlayerBalance(enumPosition) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        let initBalance;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === enumPosition) {
                if (currentStreet === this.rawActionList[i].street) {
                    initBalance = this.rawActionList[i].balance;
                } else if (initBalance !== undefined) {
                    return initBalance;
                } else {
                    return this.rawActionList[i].balance;
                }
            }
        }

        if (initBalance !== undefined) {
            return initBalance;
        }
        return this.initPlayers[this.positionEnumKeyMap[enumPosition]].initBalance;   // was't any move before
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

    wasBet(oldActionListLength) {
        let currentStreet = this.rawActionList[oldActionListLength].street;
        for (let i = oldActionListLength; i >= 0; i--) {
            if (this.rawActionList[i].street === currentStreet) {
                if (this.rawActionList[i].action < 3) {
                    return this.rawActionList[i].amount;
                }
            } else {
                return 0;
            }
        }
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

    // movesOrderC(numChairs, chairFrom, chairTo) {
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

    getRecPositionBefore(numChairs, chairFrom) {
        return (chairFrom + numChairs - 1)%numChairs;
    }

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
const playPlayers2 = [];
const playPlayers3 = [];
const playPlayers4 = [];

// export const positions = ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"];
// !!!!!!! indexes of playPlayers === recognitionPosition !!!!!!!!
playPlayers[0] = new PlayPlayer('checkmateN1', 0, 715, 10, true, false,'');
playPlayers[1] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');
playPlayers[2] = new PlayPlayer('joooe84', 2, 475, 25, true, true,'AcAd');

playPlayers2[0] = new PlayPlayer('checkmateN1', 0, 625, 100, true, false,'');
playPlayers2[1] = new PlayPlayer('3DAction', 1, 475, 25, true, false,'');
playPlayers2[2] = new PlayPlayer('joooe84', 2, 475, 25, true, true,'AcAd');

playPlayers3[0] = new PlayPlayer('checkmateN1', 0, 625, 100, true, false,'');
playPlayers3[1] = new PlayPlayer('3DAction', 1, 400, 100, true, false,'');
playPlayers3[2] = new PlayPlayer('joooe84', 2, 475, 25, true, true,'AcAd');

playPlayers4[0] = new PlayPlayer('checkmateN1', 0, 625, 100, true, false,'');
playPlayers4[1] = new PlayPlayer('3DAction', 1, 400, 100, true, false,'');
playPlayers4[2] = new PlayPlayer('joooe84', 2, 'fold', 25, false, true,'AcAd');

const frame1 = new PlayFrame(12345, 60, playPlayers, [], false, 2, 1);
const frame2 = new PlayFrame(12345, 150, playPlayers2, [], false, 2, 2);
const frame3 = new PlayFrame(12345, 225, playPlayers3, [], false, 2, 3);
const frame4 = new PlayFrame(12345, 225, playPlayers4, [], false, 2, 4);
// const frame5 = new PlayFrame(12345, 225, playPlayers4, [], false, 2, 5);    // the same frame with 4

const testSetup = new PlaySetup(frame1);
testSetup.frameHandler(frame2);
testSetup.frameHandler(frame3);
testSetup.frameHandler(frame4);
// testSetup.frameHandler(frame5);



module.exports.prompterListener = prompterListener;


