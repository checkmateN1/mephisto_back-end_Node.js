const moment = require('moment');

const enumPoker = require('../enum');
const enumCommon = require('../enum');
const validator = require('./frameCreator');
const movesHandler = require('../movesHandler-pro');



const REJECT_HAND = enumCommon.enumCommon.REJECT_HAND;
const STOP_PROMPT = enumCommon.enumCommon.STOP_PROMPT;
const PROMPT = enumCommon.enumCommon.PROMPT;
const HAND_PROMPT = enumCommon.enumCommon.HAND_PROMPT;
const INVALID_FRAME = enumCommon.enumCommon.INVALID_FRAME;

const { performance } = require('perf_hooks');

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
    constructor(player, initBalance, enumPosition, isDealer, cards) {
        this.player = player;
        this.initBalance = initBalance;
        this.enumPosition = enumPosition;
        this.isDealer = isDealer;
        this.cards = cards;
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
}

class PlaySetup {
    constructor(gameTypesSettings) {            // frame from recognition -> validator.dll -> playFrame
        this.client = null;
        this.cash = [];
        this.initPlayers = [];      // all players who was active in start. Index === recPosition, some indexes == undefined!
        this.playersWasActive = [];   // all players who was active in start without empty chairs or waiting players
        this.positionEnumKeyMap = {};
        this.handNumber = -1;
        this.bbSize = [];           // chronology of bb sizes
        this.rawActionList = [];
        this.heroChair = -1;
        this.board = [];
        this.rejectHand = false;
        this.stopPrompt = false;
        this.prevPlayFrame = [];
        this.simulationsRequests = [];  // lock nodes we already created simulations requests. 1 action has only 1 request
        this.prevPlayFrameTime = null;
        this.fantomRawActionsCount = 0;
        this.gameTypesSettings = gameTypesSettings;
        this.validator = validator.validatorCreator(this);
        this.selfRestart = 0;
        this.rejectCount = 0;

        // debug info
        this.txtFile = '';
    }

    frameHandler(rawFrame, gameTypesSettings) {
        // console.log(`start frameHandler/// this.txtFile: ${this.txtFile}`);
        this.gameTypesSettings = gameTypesSettings;
        const playFrame = this.validator.createFrame(rawFrame, this.uniqid);
        if (playFrame === INVALID_FRAME) {
            // console.log('INVALID FRAME from validator');
            return REJECT_HAND;
        }
        if (this.rejectHand && playFrame.handNumber === this.handNumber) {
            return STOP_PROMPT;
        }
        if (playFrame.handNumber !== this.handNumber) {         // new hand
            // console.log(`frameHandler/// new hand!  playFrame.handNumber: ${playFrame.handNumber}, this.handNumber: ${this.handNumber}`);
            this.sessionSetup.tasksQueue.clearIrrelevantTasks(this.handNumber);
            this.simulationsRequests = [];      // clear locked actions for simulations requests
            this.handNumber = playFrame.handNumber;
            this.cash = [];
            this.initPlayers = [];
            this.positionEnumKeyMap = {};
            this.rawActionList = [];
            this.playersWasActive = [];
            this.board = [];
            this.prevPlayFrame = [];
            this.prevPlayFrameTime = null;
            this.rejectHand = false;
            this.stopPrompt = false;
            this.rejectCount = 0;

            this.setInitPlayers(playFrame);
            this.setPositionsMap();
        }
        if (this.rejectHand) {
            return STOP_PROMPT;
        }

        this.getMovesFromFrame(playFrame);
        this.selfRestart = 0;
        // console.log('this.rawActionList at the end of getMovesFromFrame');
        // console.log(this.rawActionList);

        if (this.rejectHand) {
            return STOP_PROMPT;
        }
        if (this.prevPlayFrame.length > 1) {
            this.prevPlayFrame.shift();
        }
        this.prevPlayFrame.push(playFrame);
        this.prevPlayFrameTime = moment().format('h:mm:ss');

        // console.log(`playFrame.isButtons: ${playFrame.isButtons}, this.rejectHand: ${this.rejectHand}`);

        if (!playFrame.playPlayers[playFrame.heroRecPosition].isActive || this.wasFoldBefore(playFrame.heroRecPosition)) {
            this.stopPrompt = true;
            return STOP_PROMPT;
        }

        // if (this.needToPrompt && playFrame.isButtons) {
        // console.log(`this.whoIsNextMove(): ${this.whoIsNextMove()}`);
        return PROMPT;
    };

    getMovesFromFrame(playFrame) {
        // console.log(`getMovesFromFrame at start/// this.rawActionList.length: ${this.rawActionList.length}`);
        // first frame
        if (this.rawActionList.length === 0) {        // first frame
            // console.log(`getMovesFromFrame/// first frame!`);
            const BBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BB')]].betAmount;

            if (this.bbSize.length && BBAmount > this.bbSize[this.bbSize.length - 1] * 2.5) {       // wrong BB recognition or reraise
                this.rejectHand = true;
                this.rejectCount = 0;
                return false;
            } else if (this.bbSize.length > 2) {
                this.bbSize.shift();
            }
            this.bbSize.push(BBAmount);

            this.isNewHand = true; // сетим на фолс ВНУТРИ мувсХендлер!(callback)

            const SBSize = +(BBAmount / 2).toFixed(1);
            const BTNAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BTN')]].betAmount;

            // posts
            // constructor(street, player, balance, action, pot, amount, position, invest)
            if (this.playersWasActive.length === 2) {        // ha
                // console.log(`getMovesFromFrame 2 players was active:  BBAmount: ${BBAmount}, SBAmount: ${BTNAmount >= BBAmount ? SBSize : BTNAmount}`);
                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BTN')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BTN')]].initBalance,
                    0,
                    0,
                    BTNAmount >= BBAmount ? SBSize : BTNAmount,
                    enumPoker.enumPoker.positions.indexOf('BTN'),
                    BTNAmount >= BBAmount ? SBSize : BTNAmount));       // post SB

                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BB')]].initBalance,
                    0,
                    BTNAmount >= BBAmount ? SBSize : BTNAmount,
                    BBAmount,
                    enumPoker.enumPoker.positions.indexOf('BB'),
                    BBAmount));      // post BB
            } else {
                const SBAmount = playFrame.playPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('SB')]].betAmount;
                // console.log(`getMovesFromFrame 3+ players was active:  BBAmount: ${BBAmount}, SBAmount: ${SBAmount}`);
                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('SB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('SB')]].initBalance,
                    0,
                    0,
                    SBAmount >= BBAmount ? SBSize : SBAmount,
                    enumPoker.enumPoker.positions.indexOf('SB'),
                    SBAmount >= BBAmount ? SBSize : SBAmount));   // post SB

                this.rawActionList.push(new ActionString(
                    0,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BB')]].player,
                    this.initPlayers[this.positionEnumKeyMap[enumPoker.enumPoker.positions.indexOf('BB')]].initBalance,
                    0,
                    SBAmount >= BBAmount ? SBSize : SBAmount,
                    BBAmount,
                    enumPoker.enumPoker.positions.indexOf('BB'),
                    BBAmount));      // post BB
            }
            // console.log(`getMovesFromFrame/// first frame /// after posts// rawActionsList`);
            // console.log(this.rawActionList);
        }


        ///////////////////////////////////////////////////////
        // not first frame
        // от последнего запушенного мува не включительно, начинаем ходить по часовой стрелке до chairTo

        // let chairTo;        // стул до которого нам нужно идти в цикле по часовой стрелке, включительно - тот, который точно изменил состояние!

        if (!this.isTerminalStreetState()) {        // еще нужно добавлять мувы на эту улицу + на этой улице есть какие-то мувы!
            const curStreet = this.rawActionList[this.rawActionList.length - 1].street;

            if (playFrame.board.length === this.board.length) {             // нету перехода улицы
                const lastRecPosition = this.positionEnumKeyMap[this.rawActionList[this.rawActionList.length - 1].position];
                // console.log('lastRecPosition');
                // console.log(lastRecPosition);
                // console.log('///////////////////////');

                // console.log('no changing street');
                const chairTo = this.getChairTo(playFrame, lastRecPosition, false);
                // console.log(`chairTo: ${chairTo ? chairTo : undefined}`);

                if (chairTo !== undefined) {        // есть игрок с измененным состоянием + нету перехода улицы!
                    // запускаем цикл от последнего игрока в rawActionList до chairTo игрока и пытаемся вычислить какой тип мува и сколько вложил каждый игрок
                    // в этом состоянии всегда есть запушенные мувы(хотя бы 1) на этой улице, поэтому всегда есть lastRecPosition
                    let wasDeferredMove = false;        // был ли отложенный мув, такой как call-fold или check-raise

                    this.movesOrder(this.initPlayers.length, lastRecPosition, chairTo).forEach(chair => {
                        if (this.initPlayers[chair] !== undefined) {
                            const prevBetAmount = this.wasBet(this.rawActionList.length - 1);   // also raise
                            const prevAmount = this.getPrevAmountOnCurStreet(chair);
                            // console.log(`chair ${chair} prevAmount: ${prevAmount}`);

                            if (!playFrame.playPlayers[chair].isActive) {
                                // check on fold
                                if (!this.wasFoldBefore(chair)) {     // folded in first time
                                    // check on fold or call-fold
                                    const playerAmount = this.initPlayerBalance(this.initPlayers[chair].enumPosition) - playFrame.playPlayers[chair].curBalance;    // на случай если фишки уезжают при фолде
                                    const isCallFold = prevBetAmount === playerAmount;     // call-fold!
                                    if (isCallFold) {
                                        wasDeferredMove = true;
                                    }

                                    this.rawActionList.push(new ActionString(
                                        curStreet,
                                        this.initPlayers[chair].player,
                                        playFrame.playPlayers[chair].curBalance + (isCallFold ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount,
                                        enumPoker.enumPoker.actionsType.indexOf(isCallFold ? 'call' : 'fold'),
                                        this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                        playFrame.playPlayers[chair].betAmount,
                                        this.initPlayers[chair].enumPosition,
                                        isCallFold ? playFrame.playPlayers[chair].betAmount - prevAmount : 0));
                                }
                            } else {        // steel in game
                                const isDeferredRaise = this.isDeferredRaise(playFrame, prevBetAmount, chair, chairTo);
                                if (isDeferredRaise) {
                                    wasDeferredMove = true;
                                }

                                if (prevBetAmount) {    // was bet or raise
                                    if (prevBetAmount < playFrame.playPlayers[chair].betAmount) {       // raise or call-raise

                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            playFrame.playPlayers[chair].curBalance + (isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount,
                                            enumPoker.enumPoker.actionsType.indexOf(isDeferredRaise ? 'call' : 'raise'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount,
                                            this.initPlayers[chair].enumPosition,
                                            (isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount));

                                    } else if (prevBetAmount >= playFrame.playPlayers[chair].betAmount) {      // call
                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount - prevAmount,
                                            enumPoker.enumPoker.actionsType.indexOf('call'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            playFrame.playPlayers[chair].betAmount,
                                            this.initPlayers[chair].enumPosition,
                                            playFrame.playPlayers[chair].betAmount - prevAmount));
                                    }
                                } else {    // check or bet or check-raise?

                                    this.rawActionList.push(new ActionString(
                                        curStreet,
                                        this.initPlayers[chair].player,
                                        playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount,
                                        enumPoker.enumPoker.actionsType.indexOf(playFrame.playPlayers[chair].betAmount && !isDeferredRaise ? 'bet' : 'check'),
                                        this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                        isDeferredRaise ? 0 : playFrame.playPlayers[chair].betAmount,
                                        this.initPlayers[chair].enumPosition,
                                        isDeferredRaise ? 0 : playFrame.playPlayers[chair].betAmount));
                                }
                            }
                        }
                    });

                    if (wasDeferredMove) {      // был отложенный мув, который прошел через круг
                        // console.log(`prompterHandler /// wasDeferredMove: ${wasDeferredMove}`);
                        if (!this.selfRestart) {
                            this.fantomRawActionsCount = 0;
                            this.selfRestart += 1;
                            this.getMovesFromFrame(playFrame);        // запускаем еще раз фрейм, так как не все действия были добавлены при первом проходе
                        }
                    }

                } else {
                    // console.log(`players did't change their states. Waiting for next frame`);
                }

            } else {        // !!! есть переход улицы и на предыдущей улице все еще нужно пушить мувы
                if ((this.board.length === 3 && playFrame.board.length === 5) || (this.board.length === 0 && playFrame.board.length > 3)) {
                    // console.log(`пропущена улица и на предыдущей улице все еще нужно пушить мувы. Отменяем подсказывание`);
                    this.rejectHand = true;
                    this.rejectCount = 0;
                    return false;
                }
                // console.log(`!!! есть переход улицы и на предыдущей улице все еще нужно пушить мувы`);

                const potTerminal = playFrame.playPlayers.reduce((sum, player, index) => sum - player.betAmount, playFrame.pot);  // пот в терминальном состоянии пред улицы
                // console.log(`New street and need to fill previous. New pot: ${playFrame.pot}. Pot before new street: ${potTerminal}`);

                // проверяем пот если все вколят макс ставку на пред улице на равенство с potTerminal

                // ходим по кругу от игрока с макс амаунтом и за всех колим/фолдим умную разницу между амаунтом игрока и макс амаунтом
                const chairWithMaxAmount = this.getRecAgroChairWithMaxAmount();
                const maxAmount = this.maxAmountAtCurrentStreet();
                const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
                let potIfAllCallFold;
                let potIfAllCallFoldHeroRaise;

                // // console.log('this.rawActionList before potIfAll callFold');
                // // console.log(this.rawActionList);
                const lastRecPosition = this.positionEnumKeyMap[this.rawActionList[this.rawActionList.length - 1].position];    // на этой улице точно есть мувы
                const chairFrom = chairWithMaxAmount > -1 ? chairWithMaxAmount : lastRecPosition;
                // console.log(`chairWithMaxAmount: ${chairWithMaxAmount}, maxAmount: ${maxAmount}, chairFrom: ${chairFrom}`);
                potIfAllCallFold = this.getCallFoldPot(playFrame, chairFrom, maxAmount);       // checks too

                // // console.log('this.rawActionList after potIfAll callFold');
                // // console.log(this.rawActionList);

                // console.log('potIfAllCallFold');
                // console.log(potIfAllCallFold);

                if (Math.abs(potIfAllCallFold - potTerminal) < 3) {
                    // console.log(`nobody raise again. Make to all call/fold actions`);
                    // угадали и уже запушили мувы в равАктионс
                    if (!this.selfRestart) {
                        this.fantomRawActionsCount = 0;
                        this.selfRestart += 1;
                        this.getMovesFromFrame(playFrame);
                    }
                } else if (potTerminal > potIfAllCallFold) {  // был bet или рейз!
                    this.restoreRawAction();

                    // 1) определяем последнего повышающего. Если кроме него активны 2 и более игрока, которые могли повысить по стеку - отменяем подсказывание
                    // 2) если активный игрок кроме повышающего 1 - считаем, что повысил он.
                    // если не было повышений - отменяем подсказывание
                    let raisedChair = -1;
                    let isMaxAgroAmountBBPost;
                    for (let i = this.rawActionList.length - 1; i >= 0; i--) {
                        if (this.initPlayers[chairFrom].enumPosition === this.rawActionList[i].position) {
                            if (this.rawActionList[i].action === 0) {
                                isMaxAgroAmountBBPost = true;
                            }
                            break;
                        }
                    }

                    let freezeFantomRawActionsCount = 0;        // инкрементируем при добавлении не агрессивного действия за игрока
                    const possibleToRaiseCount = this.movesOrder(this.initPlayers.length, this.getLastRawActionsChair(), isMaxAgroAmountBBPost ? chairFrom : this.getRecPositionBefore(this.initPlayers.length, chairFrom)).reduce((isSteelPossible, chair) => {
                        // console.log(`trying to find raisers inside possibleToRaiseCount = movesOrder// chair: ${chair}`);
                        if (isSteelPossible && this.initPlayers[chair] !== undefined) {
                            // проверям, что игрок уже не колил макс амаунт
                            let isCallMaxAmount;
                            for (let i = this.rawActionList.length - 1; i >= 0; i--) {
                                if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position && chair !== chairFrom) {
                                    if ((this.rawActionList[i].action === 3 || this.rawActionList[i].action === 4) && this.rawActionList[i].amount === maxAmount && this.rawActionList[i].street === currentStreet) {
                                        isCallMaxAmount = true;
                                    }
                                    break;
                                }
                            }

                            if (!isCallMaxAmount) {
                                const terminalBalance = playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount;
                                const nextRawActionBalance = this.getPrevRecBalanceOnCurStreet(chair);
                                const prevAmount = this.getPrevAmountOnCurStreet(chair);
                                const balanceDiff = nextRawActionBalance - terminalBalance;
                                if (!this.wasFoldBefore(chair)) {
                                    // console.log(`inside possibleToRaiseCount = movesOrder// chair: ${chair}, was not FoldBefore, balanceDiff: ${balanceDiff}`);
                                    if (balanceDiff) {     // call-call or raise!
                                        // raise
                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            nextRawActionBalance,
                                            enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'raise' : 'bet'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            prevAmount + balanceDiff,
                                            this.initPlayers[chair].enumPosition,
                                            balanceDiff));

                                        this.fantomRawActionsCount++;

                                        // console.log('this.rawActionList before potIfAllCallFold');
                                        // console.log(this.rawActionList);

                                        const potIfAllCallFold = this.getCallFoldPot(playFrame, chair, prevAmount + balanceDiff);

                                        // console.log(`inside possibleToRaiseCount = movesOrder// chair raise: ${chair}, potIfAllCallFold: ${potIfAllCallFold}`);
                                        // console.log('this.rawActionList after potIfAllCallFold');
                                        // console.log(this.rawActionList);

                                        if (Math.abs(potIfAllCallFold - potTerminal) < 3) {
                                            if (raisedChair < 0) {
                                                // console.log(`potIfAllCallFold === potTerminal// raisedChair === -1`);
                                                raisedChair = chair;
                                                if (ms < 3500) {    // fast raise and we suppose raiser was first chair
                                                    // console.log(`time between frames was: ${ms}, and we suppose that chair: ${chair} raised first`);
                                                    return false;   // isSteelPossible = false;
                                                }
                                            } else {        // 2 or more raisers
                                                // console.log(`potIfAllCallFold === potTerminal// raisedChair: ${raisedChair}`);
                                                raisedChair = -1;
                                                return false;   // isSteelPossible = false;
                                            }
                                        }
                                        this.restoreRawAction(freezeFantomRawActionsCount);

                                        if (chair !== chairFrom) {
                                            // call-call
                                            const callAmount = Math.min(nextRawActionBalance + prevAmount, maxAmount);
                                            this.rawActionList.push(new ActionString(
                                                curStreet,
                                                this.initPlayers[chair].player,
                                                nextRawActionBalance,
                                                enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'call' : 'check'),
                                                this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                callAmount,
                                                this.initPlayers[chair].enumPosition,
                                                Math.min(maxAmount - prevAmount, nextRawActionBalance)));

                                            this.fantomRawActionsCount++;
                                            freezeFantomRawActionsCount++;
                                        }

                                    } else {    // fold
                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            nextRawActionBalance,
                                            enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'fold' : 'check'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            prevAmount,
                                            this.initPlayers[chair].enumPosition,
                                            0));

                                        this.fantomRawActionsCount++;
                                        freezeFantomRawActionsCount++;
                                    }
                                }
                            }
                        }
                        return isSteelPossible;
                    }, true);

                    this.restoreRawAction();

                    // console.log(`possibleToRaiseCount: ${possibleToRaiseCount}, raisedChair: ${raisedChair}`);

                    if (raisedChair > -1) {         // found ONE raiser!
                        let passHero = false;
                        this.movesOrder(this.initPlayers.length, this.getLastRawActionsChair(), isMaxAgroAmountBBPost ? chairFrom : this.getRecPositionBefore(this.initPlayers.length, chairFrom)).forEach(chair => {
                            // console.log(`after found raisedChair: ${raisedChair}, inside movesOrder// chair: ${chair}`);
                            if (!passHero && this.initPlayers[chair] !== undefined) {
                                const terminalBalance = playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount;
                                const nextRawActionBalance = this.getPrevRecBalanceOnCurStreet(chair);
                                const prevAmount = this.getPrevAmountOnCurStreet(chair);
                                const balanceDiff = nextRawActionBalance - terminalBalance;
                                if (!this.wasFoldBefore(chair)) {
                                    if (balanceDiff) {     // call-call or raise!
                                        // raise
                                        if (raisedChair === chair) {
                                            this.rawActionList.push(new ActionString(
                                                curStreet,
                                                this.initPlayers[chair].player,
                                                nextRawActionBalance,
                                                enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'raise' : 'bet'),
                                                this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                prevAmount + balanceDiff,
                                                this.initPlayers[chair].enumPosition,
                                                balanceDiff));

                                            this.getCallFoldPot(playFrame, chair, prevAmount + balanceDiff);
                                            passHero = true;
                                        } else {
                                            // call-call
                                            const callAmount = Math.min(nextRawActionBalance + prevAmount, maxAmount);
                                            this.rawActionList.push(new ActionString(
                                                curStreet,
                                                this.initPlayers[chair].player,
                                                nextRawActionBalance,
                                                enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'call' : 'check'),
                                                this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                callAmount,
                                                this.initPlayers[chair].enumPosition,
                                                Math.min(maxAmount - prevAmount, nextRawActionBalance)));
                                        }

                                    } else {    // fold
                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            nextRawActionBalance,
                                            enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'fold' : 'check'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            prevAmount,
                                            this.initPlayers[chair].enumPosition,
                                            0));
                                    }
                                }
                            }
                        });
                        this.fantomRawActionsCount = 0;

                        // console.log('запускаем повторно getMovesFromFrame после того как заполнили предыдущую улицу');
                        if (!this.selfRestart) {
                            this.selfRestart += 1;
                            this.getMovesFromFrame(playFrame);    // запускаем еще раз фрейм, так как не все действия были добавлены при первом проходе
                        }

                    } else {
                        // console.log('Ошибка с рассчетом пота или 2 и более возможных рейзера');
                        this.rejectHand = true;
                        this.rejectCount = 0;
                        return false;
                    }

                } else {        // терминальный пот меньше
                    // console.log('аномально большой пот если все вколили/сфолдили... разбираться!');
                    if (this.rejectCount > 1) {
                        this.rejectHand = true;
                        this.rejectCount = 0;
                    } else {
                        this.rejectCount++;
                    }
                    return false;
                }
            }
        } else {        // !!терминальное состояние!! ждем борда или кнопок хиро или чайрТу, вложившего деньги, или распознаем шоудауны
            // console.log('!!!terminal state');
            if (this.rawActionList[this.rawActionList.length - 1].street === 5) {   // терминальное на ривере
                // console.log('terminal river state');
                // ждем и собираем шоудауны.. формируем историю руки с победами
            } else if ((this.rawActionList[this.rawActionList.length - 1].street === 0 && playFrame.board.length === 4)
                || (this.rawActionList[this.rawActionList.length - 1].street === 1 && playFrame.board.length === 5)) {
                // console.log('skipped one street between frames');
                // если вырос пот - отменяем раздачу.. если нет - пушим за всех чеки и сетим борд
                const lastRawPot = this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest;
                const potTerminal = playFrame.playPlayers.reduce((sum, player, index) => sum - player.betAmount, playFrame.pot);  // пот в терминальном состоянии пред улицы
                // console.log(`New street and terminal state at previous. New pot: ${playFrame.pot}. Pot before new street(potTerminal): ${potTerminal}, lastRawPot: ${lastRawPot}`);
                // проверяем пот если все вколят макс ставку на пред улице на равенство с potTerminal

                // ходим по кругу от игрока с макс амаунтом и за всех колим/фолдим умную разницу между амаунтом игрока и макс амаунтом
                const street = this.rawActionList[this.rawActionList.length - 1].street + 1;

                if (potTerminal === lastRawPot) {   // all players checked
                    const firstChair = this.positionEnumKeyMap[this.getFirstEnumPositionToMove(false)];
                    const positionBefore = this.getRecPositionBefore(this.initPlayers.length, firstChair);

                    this.movesOrder(this.initPlayers.length, positionBefore, positionBefore).forEach(chair => {
                        if (this.initPlayers[chair] !== undefined && !this.wasFoldBefore(chair)) {
                            this.rawActionList.push(new ActionString(
                                street,
                                this.initPlayers[chair].player,
                                this.getLastValidMoveBalance(chair),
                                enumPoker.enumPoker.actionsType.indexOf('check'),
                                lastRawPot,
                                0,
                                this.initPlayers[chair].enumPosition,
                                0));
                        }
                    });
                } else {
                    // console.log(`was raise and we does not know who exact. Reject hand`);
                    this.rejectHand = true;
                    this.rejectCount = 0;
                    return false;
                }

                // console.log('rawActions after all checked');
                // console.log(this.rawActionList);
                // console.log('запускаем повторно frameHandler после того как добавили всем чеки');
                if (!this.selfRestart) {
                    this.selfRestart += 1;
                    this.getMovesFromFrame(playFrame);    // запускаем еще раз фрейм, так как не все действия были добавлены при первом проходе
                }
                // или игроки выставились. Ждем и собираем шоудауны.. формируем историю руки с победами.
            } else {     // появилась новая карта борда и возможно мувы ИЛИ просто ждем новых мувов
                // console.log(`this.board`);
                // console.log(this.board);
                let isBoardOk;
                if (this.board.length < playFrame.board.length) {
                    // console.log('new board card!');
                    isBoardOk = this.setBoard(playFrame);
                }

                const curStreet = this.getStreetNumber();
                if (isBoardOk
                    || (this.board.length === playFrame.board.length
                    && this.rawActionList[this.rawActionList.length - 1].street < curStreet)) {
                    // запускаем Поиск чайрТу и пушим мувы по стандартной схеме
                    const firstChair = this.positionEnumKeyMap[this.getFirstEnumPositionToMove(false)];
                    // console.log(`seted board ok, terminal state and firstChair to move at new street is: ${firstChair}`);
                    // const chairTo = this.getChairTo(playFrame, this.getRecPositionBefore(this.initPlayers.length, firstChair), true);
                    const chairTo = this.getChairTo(playFrame, firstChair, true);

                    // console.log(`new street and terminal state. Try to get chairTo: ${chairTo !== undefined ? chairTo : ''}`);

                    if (chairTo !== undefined) {        // есть игрок с измененным состоянием + нету перехода улицы!
                        // запускаем цикл от последнего игрока в rawActionList до chairTo игрока и пытаемся вычислить какой тип мува и сколько вложил каждый игрок
                        // в этом состоянии всегда есть запушенные мувы(хотя бы 1) на этой улице, поэтому всегда есть lastRecPosition
                        let wasDeferredMove = false;        // был ли отложенный мув, такой как call-fold или check-raise

                        this.movesOrder(this.initPlayers.length, this.getRecPositionBefore(this.initPlayers.length, firstChair), chairTo).forEach((chair, index) => {
                            // console.log(`inside movesOrder after getting chairTo/// chair: ${chair}`);
                            if (this.initPlayers[chair] !== undefined) {
                                const prevBetAmount = index === 0 ? 0 : this.wasBet(this.rawActionList.length - 1, curStreet !== this.rawActionList[this.rawActionList.length - 1].street);   // also raise
                                const prevAmount = index === 0 ? 0 : this.getPrevAmountOnCurStreet(chair, true);
                                // console.log(`chair ${chair} prevAmount: ${prevAmount}`);

                                if (!playFrame.playPlayers[chair].isActive) {
                                    // check on fold
                                    if (!this.wasFoldBefore(chair)) {     // folded in first time
                                        // check on fold or call-fold
                                        const playerAmount = this.initPlayerBalance(this.initPlayers[chair].enumPosition, curStreet) - playFrame.playPlayers[chair].curBalance;    // на случай если фишки уезжают при фолде
                                        const isCallFold = prevBetAmount === playerAmount;     // call-fold!
                                        if (isCallFold) {
                                            wasDeferredMove = true;
                                        }

                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            playFrame.playPlayers[chair].curBalance + (isCallFold ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount,
                                            enumPoker.enumPoker.actionsType.indexOf(isCallFold ? (prevBetAmount ? 'call' : 'check') : 'fold'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            playFrame.playPlayers[chair].betAmount,
                                            this.initPlayers[chair].enumPosition,
                                            isCallFold ? playFrame.playPlayers[chair].betAmount - prevAmount : 0));
                                    }
                                } else {        // steel in game
                                    const isDeferredRaise = this.isDeferredRaise(playFrame, prevBetAmount, chair, chairTo);
                                    if (isDeferredRaise) {
                                        wasDeferredMove = true;
                                    }

                                    // console.log(`inside movesOrder after getting chairTo/// chair: ${chair}, isDeferredRaise: ${isDeferredRaise}, prevBetAmount: ${prevBetAmount}`);

                                    if (prevBetAmount) {    // was bet or raise
                                        if (prevBetAmount < playFrame.playPlayers[chair].betAmount) {       // raise or call-raise?
                                            this.rawActionList.push(new ActionString(
                                                curStreet,
                                                this.initPlayers[chair].player,
                                                playFrame.playPlayers[chair].curBalance + (isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount,
                                                enumPoker.enumPoker.actionsType.indexOf(isDeferredRaise ? 'call' : 'raise'),
                                                this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount,
                                                this.initPlayers[chair].enumPosition,
                                                (isDeferredRaise ? prevBetAmount : playFrame.playPlayers[chair].betAmount) - prevAmount));

                                        } else if (prevBetAmount === playFrame.playPlayers[chair].betAmount) {      // call
                                            this.rawActionList.push(new ActionString(
                                                curStreet,
                                                this.initPlayers[chair].player,
                                                playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount - prevAmount,
                                                enumPoker.enumPoker.actionsType.indexOf('call'),
                                                this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                                playFrame.playPlayers[chair].betAmount,
                                                this.initPlayers[chair].enumPosition,
                                                playFrame.playPlayers[chair].betAmount - prevAmount));
                                        } else {
                                            // console.log(`inside movesOrder after getting chairTo/// chair: ${chair}. prevBetAmount > playFrame.playPlayers[chair].betAmount!!! Error!!`);
                                        }
                                    } else {    // check or bet or check-raise?

                                        this.rawActionList.push(new ActionString(
                                            curStreet,
                                            this.initPlayers[chair].player,
                                            playFrame.playPlayers[chair].curBalance + playFrame.playPlayers[chair].betAmount,
                                            enumPoker.enumPoker.actionsType.indexOf(playFrame.playPlayers[chair].betAmount && !isDeferredRaise ? 'bet' : 'check'),
                                            this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                            isDeferredRaise ? 0 : playFrame.playPlayers[chair].betAmount,
                                            this.initPlayers[chair].enumPosition,
                                            isDeferredRaise ? 0 : playFrame.playPlayers[chair].betAmount));
                                    }
                                }
                            }
                        });

                        if (wasDeferredMove) {      // был отложенный мув, который прошел через круг
                            if (!this.selfRestart) {
                                this.fantomRawActionsCount = 0;
                                this.selfRestart += 1;
                                this.getMovesFromFrame(playFrame);        // запускаем еще раз фрейм, так как не все действия были добавлены при первом проходе
                            }
                        }
                    } else {
                        // console.log(`players did't change their states. Waiting for next frame`);
                    }
                }
            }
        }
    }

    getHeroHand() {
        let hand;
        this.initPlayers.forEach((player, i) => {
            if (player.cards && i === this.heroChair) {
                const {
                    hole1Value,
                    hole2Value,
                    hole1Suit,
                    hole2Suit,
                } = player.cards;
                hand = hole1Value.toUpperCase() + hole1Suit + hole2Value.toUpperCase() + hole2Suit;
            }
        });
        return hand;
    }

    createMainPrompt(playFrame) {
        if (!this.rawActionList.length) {
            return {};
        }

        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        const agroChair = this.getRecAgroChairWithMaxAmount();

        let heroCards;
        const isTerminal = this.isTerminalStreetState();
        const curStreet = this.getStreetNumber(this.board.length);
        const players = this.initPlayers.map((player, i) => {
            if (player.cards && i === playFrame.heroRecPosition) {
                heroCards = player.cards;
            }

            return {
                nickname: player.player,
                balance: this.getLastValidMoveBalance(i)/100,
                bet: (curStreet !== currentStreet && isTerminal) ? 0 : this.getLastMoveAmount(i)/100,
                isDealer: player.isDealer,
                agroClass: i === agroChair ? 'bet-raise' : 'check-call',
            };
        });

        const pot = this.getPot()/100;

        return {
            players,
            pot,
            heroCards,
            enumPoker,
            board: this.board,
            status: 'wait prompt',
        };
    }

    restoreRawAction(count) {
        while(this.fantomRawActionsCount - (count || 0)) {
            this.rawActionList.pop();
            this.fantomRawActionsCount--
        }
    }

    setBoard(playFrame) {
        const curStreet = this.rawActionList[this.rawActionList.length - 1].street;
        if (curStreet < this.getStreetNumber(playFrame.board.length)) {
            if (curStreet === 0) {
                const isValidFlop = playFrame.board.filter(card => card !== undefined).length === playFrame.board.length;
                if (isValidFlop) {
                    this.board = playFrame.board.slice();
                    return true;
                }
            } else {
                if (playFrame.board[playFrame.board.length - 1] !== undefined) {
                    this.board.push(Object.assign({}, playFrame.board[playFrame.board.length - 1]));
                    return true;
                }
            }
        }

        return false;
    }

    isDeferredRaise(playFrame, prevMaxAmount, chair, chairTo) {
        // проверяем уравнивал ли кто-то после chair prevMaxAmount - если да - был чек-рейз или бет-рейз
        if (chair === chairTo) {
            return false;
        }
        const chairAmount = playFrame.playPlayers[chair].betAmount;
        let passChairTo = false;
        return this.movesOrder(this.initPlayers.length, chair, this.getRecPositionBefore(this.initPlayers.length, chair)).reduce((wasPrevMaxCall, chair) => {
            if (this.initPlayers[chair] !== undefined) {
                if (passChairTo) {return wasPrevMaxCall;}
                if (chair !== chairTo) {
                    return wasPrevMaxCall || (playFrame.playPlayers[chair].betAmount < chairAmount && playFrame.playPlayers[chair].curBalance > 0 && playFrame.playPlayers[chair].isActive)
                } else {
                    passChairTo = true;
                    return wasPrevMaxCall;
                }
            } else {
                return wasPrevMaxCall;
            }
        }, false);
    }

    getLastRawActionsChair() {
        return this.positionEnumKeyMap[this.rawActionList[this.rawActionList.length - 1].position];
    }

    getLastRawAction(chair) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return this.rawActionList[i].action;
            }
        }
        return -1;   // was't any move before
    }

    getCallFoldPot (playFrame, chairWithMaxAmount, maxAmount, street) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        const isBBCanCheck = currentStreet === 0 && this.getLastRawAction(chairWithMaxAmount) === 0;    // bb raise last on preflop and had max amount
        const chairTo = isBBCanCheck ? chairWithMaxAmount : this.getRecPositionBefore(this.initPlayers.length, chairWithMaxAmount);
        return this.movesOrder(this.initPlayers.length, this.getLastRawActionsChair(), chairTo).reduce((pot, chair) => {
            // console.log(`inside getCallFoldPot/// chair: ${chair}`);
            // console.log(`inside getCallFoldPot/// this.rawActionlist in start getCallFoldPot`);
            // console.log(this.rawActionList);
            if (this.initPlayers[chair] !== undefined) {
                for (let i = this.rawActionList.length - 1; i >= -1; i--) {
                    if (i > -1 && (street || currentStreet) === this.rawActionList[i].street) {
                        if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position) {
                            if (this.rawActionList[i].action === 5                                  // folded
                            || this.rawActionList[i].balance - this.rawActionList[i].invest === 0   // player in all-in
                            || (this.rawActionList[i].amount === maxAmount && i !== 1)) {           // called max amount but did not post BB
                                return pot;
                            } else {
                                // если не уменьшился баланс относительно запушенного И амаунт меньше макс амаунта И баланс > 0 - то игрок сфолдил здесь
                                // console.log(`test inside potCallFold// found move with position and did not fold before for chair: ${chair}, index: ${i}`);
                                // console.log(`this.rawActionList[i].balance - this.rawActionList[i].invest: ${this.rawActionList[i].balance - this.rawActionList[i].invest}, playFrame.playPlayers[chair].curBalance: ${playFrame.playPlayers[chair].curBalance}`);
                                if (this.rawActionList[i].balance - this.rawActionList[i].invest === playFrame.playPlayers[chair].curBalance
                                    && this.rawActionList[i].amount < maxAmount
                                    && this.rawActionList[i].balance - this.rawActionList[i].invest > 0) {     // fold here

                                    this.rawActionList.push(new ActionString(
                                        street || currentStreet,
                                        this.initPlayers[chair].player,
                                        this.rawActionList[i].balance - this.rawActionList[i].invest,
                                        enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'fold' : 'check'),
                                        this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                        0,
                                        this.initPlayers[chair].enumPosition,
                                        0));

                                    this.fantomRawActionsCount++;
                                    return pot;
                                }

                                const smartRestBalance = this.rawActionList[i].balance - this.rawActionList[i].invest;
                                const amountsDiff = maxAmount - this.rawActionList[i].amount;
                                const callAmount = Math.min(smartRestBalance, amountsDiff);

                                this.rawActionList.push(new ActionString(
                                    street || currentStreet,
                                    this.initPlayers[chair].player,
                                    smartRestBalance,
                                    enumPoker.enumPoker.actionsType.indexOf(amountsDiff ? 'call' : 'check'),
                                    this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                    this.rawActionList[i].amount + callAmount,
                                    this.initPlayers[chair].enumPosition,
                                    callAmount));

                                // // console.log(`test inside callfold after call/check push/// this.rawActionList:`);
                                // // console.log(this.rawActionList);

                                this.fantomRawActionsCount++;
                                return pot + callAmount;
                            }
                        }
                    } else {    // не ходил на этой улице
                        if (!this.wasFoldBefore(chair)) {
                            const balance = this.initPlayerBalance(this.initPlayers[chair].enumPosition);
                            if ((maxAmount && balance > playFrame.playPlayers[chair].curBalance) || !maxAmount) {
                                // console.log(`chair: ${chair} did not move before at cur street, playFrame.playPlayers[chair].curBalance: ${playFrame.playPlayers[chair].curBalance}, balance: ${balance}`);
                                const callAmount = Math.min(balance, maxAmount);

                                this.rawActionList.push(new ActionString(
                                    street || currentStreet,
                                    this.initPlayers[chair].player,
                                    balance,
                                    enumPoker.enumPoker.actionsType.indexOf(maxAmount ? 'call' : 'check'),
                                    this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                    callAmount,
                                    this.initPlayers[chair].enumPosition,
                                    callAmount));

                                this.fantomRawActionsCount++;
                                return pot + callAmount;
                            } else {

                                this.rawActionList.push(new ActionString(
                                    street || currentStreet,
                                    this.initPlayers[chair].player,
                                    balance,
                                    enumPoker.enumPoker.actionsType.indexOf('fold'),
                                    this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest,
                                    0,
                                    this.initPlayers[chair].enumPosition,
                                    0));

                                this.fantomRawActionsCount++;
                                return pot;
                            }
                        }
                        return pot;
                    }
                }
            } else {
                return pot;
            }
        }, this.rawActionList[this.rawActionList.length - 1].pot + this.rawActionList[this.rawActionList.length - 1].invest);
    }

    getChairTo(playFrame, lastRecPosition, isTerminalState) {
        const positionBefore = this.getRecPositionBefore(this.initPlayers.length, lastRecPosition);
        let chairTo;

        this.getReversListOrder(this.initPlayers.length, isTerminalState ? positionBefore : lastRecPosition).forEach(chair => {
        // this.getReversListOrder(this.initPlayers.length, lastRecPosition).forEach(chair => {
            // console.log(`inside getChairTo/// lastRecPosition: ${lastRecPosition}, chair: ${chair}`);
            // played
            if (chairTo === undefined && this.initPlayers[chair] !== undefined) {
                if (!playFrame.playPlayers[chair].isActive) {
                    // check on fold
                    if (!this.wasFoldBefore(chair)) {     // folded in first time
                        chairTo = chair;
                    }
                } else {
                    if (isTerminalState || !this.wasAnyMoveBeforeOnCurStreet(chair)) {     // no moves before but steel isActive
                        // вложил деньги
                        if (playFrame.playPlayers[chair].betAmount) {
                            // console.log(`chair ${chair} invest money and he will be set as chairTo`);
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

        // если видели кнопки на предыдущем фрейме а на текущем их нету..
        if (chairTo === undefined
            && this.prevPlayFrame[0]
            && this.prevPlayFrame[0].isButtons
            && this.prevPlayFrame[0].pot === playFrame.pot
            && this.prevPlayFrame[1]
            && !this.prevPlayFrame[1].isButtons
            && !playFrame.isButtons
            && this.prevPlayFrame[0].board.length === playFrame.board.length
            && this.prevPlayFrame[1].board.length === playFrame.board.length
            && this.rawActionList[this.rawActionList.length - 1].position !== this.initPlayers[playFrame.heroRecPosition].enumPosition) {     // hero moved
            // console.log('nobody invested, but was buttons at previous frame and no buttons at the moment. Setting chairTo to heroRecPosition');

            chairTo = playFrame.heroRecPosition;     // spin&go chair 2
        }

        // если видим кнопки - игрок перед хиро походил
        const positionAfter = this.getRecPositionAfter(this.initPlayers.length, lastRecPosition);
        if (chairTo === undefined && playFrame.isButtons && (isTerminalState ? lastRecPosition : positionAfter) !== playFrame.heroRecPosition) {     // hero's turn
            // console.log(`enter additional condition in getChairTo: see buttons`);
            const positionBefore = this.getRecPositionBefore(this.initPlayers.length, playFrame.heroRecPosition);
            // console.log('see buttons and nobody invested and hero did not start first - setting chairTo as player before hero');
            chairTo = positionBefore;     // spin&go chair 2
        }

        // если на новой улице первый ход хиро, но 2 фрейма нету кнопок и никто не вложил деньги - чайрТу = стул хиро(хиро чек)
        if (chairTo === undefined
            && isTerminalState
            && !playFrame.isButtons
            && !this.prevPlayFrame[this.prevPlayFrame.length - 1].isButtons
            && lastRecPosition === playFrame.heroRecPosition
            && this.prevPlayFrame[this.prevPlayFrame.length - 1].board.length === playFrame.board.length
            && this.getStreetNumber(playFrame.board.length) > this.rawActionList[this.rawActionList.length - 1].street) {     // hero's turn

            // console.log(`two frames did not see buttons and hero turn at new street. Set chairTo as hero position`);
            chairTo = playFrame.heroRecPosition;     // spin&go chair 2
        }

        return chairTo;
    }

    getMovesCount(street) {
        return this.rawActionList.filter(action => action.street === street).length;
    }

    wasAnyMoveBeforeOnCurStreet(chair) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        return !!this.rawActionList.filter(action => action.street === currentStreet && this.initPlayers[chair].enumPosition === action.position).length;
    }

    getPrevAmountOnCurStreet(chair, isTerminal) {
        const currentStreet = isTerminal ? Math.min(this.rawActionList[this.rawActionList.length - 1].street + 1, 3) : this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (currentStreet === this.rawActionList[i].street) {
                if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position) {
                    return this.rawActionList[i].amount;
                }
            } else {
                return 0;
            }
        }
        return 0;
    }

    getPrevRecBalanceOnCurStreet(chair) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (currentStreet === this.rawActionList[i].street) {
                if (this.initPlayers[chair].enumPosition === this.rawActionList[i].position) {
                    return this.rawActionList[i].balance - this.rawActionList[i].invest;
                }
            } else {
                return this.initPlayerBalance(this.initPlayers[chair].enumPosition, currentStreet);
            }
        }
        return this.initPlayers[chair].initBalance;   // was't any move before
    }

    wasFoldBefore(chair) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return this.rawActionList[i].action === 5;  // fold
            }
        }
        return false;
    }

    getLastValidMoveBalance(chair) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return this.rawActionList[i].balance - this.rawActionList[i].invest;
            }
        }
        return this.initPlayers[chair].initBalance;   // was't any move before
    }

    getLastValidMoveAmount(chair) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return this.rawActionList[i].amount;
            }
        }
        return 0;   // was't any move before
    }

    getLastMoveAmount(chair) {
        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return currentStreet === this.rawActionList[i].street ? this.rawActionList[i].amount : 0;
            }
        }
        return 0;   // was't any move before
    }

    getLastValidMoveStreet(chair) {
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === this.initPlayers[chair].enumPosition) {
                return this.rawActionList[i].street;
            }
        }
        return this.initPlayers[chair].initBalance;   // was't any move before
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

    getRecAgroChairWithMaxAmount() {
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
        const playersInGame = [];       //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд
        const blackList = [];
        const allPlayers = [];
        for (let i = this.rawActionList.length - 1; i >= 0; i--) { //добавляем всех кто сфолдил или баланс = 0
            if (Math.abs(this.initPlayerBalance(this.rawActionList[i].position) - this.rawActionList[i].amount) < 1 || this.rawActionList[i].action === 5) {
                blackList.push(this.rawActionList[i].position);
            }
        }

        this.initPlayers.forEach(player => {
            allPlayers.push(player.enumPosition);
        });

        for (let i = allPlayers.length - 1; i >= 0; i--) { // добавляем только тех кто остался
            if (blackList.indexOf(allPlayers[i]) < 0) {
                playersInGame.push(allPlayers[i]);
            }
        }
        return playersInGame;
    }

    // инициальный баланс на текущей улице(или указанной). Так же используется для валидации и замены глючных амаунтов или балансов
    // выдает то, что мы запишем в баланс первого мува на текущей улице в rawActions
    initPlayerBalance(enumPosition, street) {
        const currentStreet = street !== undefined ? street : this.rawActionList[this.rawActionList.length - 1].street;
        let initBalance;
        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
            if (this.rawActionList[i].position === enumPosition) {
                if (currentStreet === this.rawActionList[i].street) {
                    initBalance = this.rawActionList[i].balance;
                } else if (initBalance !== undefined) {
                    return initBalance;
                } else {
                    return this.rawActionList[i].balance - this.rawActionList[i].invest;
                }
            }
        }

        if (initBalance !== undefined) {
            return initBalance;
        }

        return this.initPlayers[this.positionEnumKeyMap[enumPosition]].initBalance;   // was't any move before
    }

    getStreetNumber(length) {
        const blength = length === undefined ? this.board.length : length;
        switch (blength) {
            case 0:
                return 0;
            case 3:
                return 1;
            case 4:
                return 2;
            case 5:
                return 3;
            default:
                return 0;
        }
    }

    isTerminalStreetState() {
        const currentAmount = this.maxAmountAtCurrentStreet();
        const nPlayers = this.whoIsInGame();    //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд. массив с позициями

        const currentStreet = this.rawActionList[this.rawActionList.length - 1].street;
        if (this.rawActionList[this.rawActionList.length - 1].action < 3) {return false;}

        // BB moves ones exception
        if (currentStreet === 0 && this.rawActionList.filter(action => action.position === this.rawActionList[1].position).length === 1) {
            return false;
        }

        for (let i = this.rawActionList.length - 1; i >= 0; i--) {
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

    getPotStartStreet() {
        const lastStreet = this.rawActionList[this.rawActionList.length - 1].street;
        return this.rawActionList.reduce((sum, current) => sum + (current.street !== lastStreet ? current.invest : 0), 0);
    }

    // return the last bet or raise amount
    wasBet(oldActionListLength, isTerminal) {
        const currentStreet = isTerminal ? Math.min(this.rawActionList[oldActionListLength].street + 1, 3) : this.rawActionList[oldActionListLength].street;
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

    // возвращает enum позицию того кто будет ходить следующим
    whoIsNextMove(isTerminal) {
        const nPlayers = this.whoIsInGame();
        if (isTerminal !== undefined ? isTerminal : this.isTerminalStreetState()) {
            return Math.max(...nPlayers); // наибольшее число из массива
        } else {
            nPlayers.sort((a,b) => a-b);
            for (let i = this.rawActionList.length - 1; i >= 0; i--) {
                if (nPlayers.indexOf(this.rawActionList[i].position) >= 0) {
                    if (nPlayers.indexOf(this.rawActionList[i].position) > 0) { // если игрок не в позиции ко всем оставшимся
                        return nPlayers[nPlayers.indexOf(this.rawActionList[i].position) - 1]; // возвращаем более ближнего к BTN
                    } else {return nPlayers[nPlayers.length - 1];} // если он ближайший к бтн - ходить будет ближайший к SB
                }
            }
        }
    }


    isValidTerminalBoardState(isTerminal) {
        if (!isTerminal) {return true;}
        const boardStreet = this.getStreetNumber();
        return boardStreet > this.rawActionList[this.rawActionList.length - 1].street;
    }

    setInitPlayers(firstPlayFrame) {
        // console.log('setInitPlayers');
        this.playersWasActive = firstPlayFrame.playPlayers.filter(player => (player.isActive || (!player.isActive && (player.isDealer || player.betAmount > 0))));

        const p0Dealer = ['BTN', 'SB', 'BB'];
        const p1Dealer = ['BB', 'BTN', 'SB'];
        const p2Dealer = ['SB', 'BB', 'BTN'];
        const pXD = [p0Dealer, p1Dealer, p2Dealer];

        // console.log('this.playersWasActive');
        // console.log(this.playersWasActive);

        if (this.playersWasActive.length === 2) {    // ha'

            // console.log('2 players!');

            this.playersWasActive.forEach(player => {
                this.initPlayers[player.recognitionPosition] = new InitPlayer(
                    player.nickname,
                    player.curBalance + player.betAmount,
                    enumPoker.enumPoker.positions.indexOf(player.isDealer ? 'BTN' : 'BB'),
                    player.isDealer,
                    player.cards);
            });
        } else if (this.playersWasActive.length === 3) {     // spins or other 3 max
            // console.log('3 players!');

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
                    enumPoker.enumPoker.positions.indexOf(pXDealer[player.recognitionPosition]),
                    player.isDealer,
                    player.cards);
            });
        }
        // console.log('setInitPlayers: this.initPlayers');
        // console.log(this.initPlayers);
        if (!this.initPlayers.length) {
            this.rejectHand = true;
            this.rejectCount = 0;
        }
    }

    setPositionsMap() {
        // console.log('this.playersWasActive');
        // console.log(this.playersWasActive);
        this.initPlayers.forEach((initPlayer, index) => {
            if (initPlayer !== undefined) {
                this.positionEnumKeyMap[initPlayer.enumPosition] = index;
            }
        });
        // console.log('this.positionEnumKeyMap');
        // console.log(this.positionEnumKeyMap);
    }

    getFirstEnumPositionToMove(isPreflop) {
        return isPreflop ? Math.max(0, (this.playersWasActive.length - 3)) : (this.playersWasActive.length === 2 ? 8 : 9);
    }

    // movesOrderC(numChairs, chairFrom, chairTo) {
    //     for(let ch = chairFrom; ch%numChairs !== chairTo; ch++) {
    //         // console.log(ch%numChairs);
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

    getRecPositionAfter(numChairs, chairFrom) {
        return (chairFrom + numChairs + 1)%numChairs;
    }

    getReversListOrder(numChairs, chairFrom) {
        const arr = [];
        for(let i = numChairs; i > 0; i--) {
            arr.push((chairFrom + i)%numChairs);
        }
        return arr;
    }

    handPrompt(strategy, handNumber, move_id, id) {
        const {
            client,
        } = this;

        // console.log('promptData before sending client HAND_PROMPT');
        // console.log(promptData);

        // console.log(`Exit /// performance.now(): ${performance.now()}`);

        if (handNumber === this.handNumber && move_id === this.rawActionList.length && !this.rejectHand && !this.stopPrompt && client) {
            const wasBet = this.wasBet((this.rawActionList.length - 1));
            const maxAmount = this.maxAmountAtCurrentStreet();
            const promptData = {
                hand_prompt: {
                    strategy,
                    wasBet,
                    maxAmount,
                    hand_move_id: move_id,
                    hand_handNumber: handNumber,
                },
                id,
            };

            setTimeout(() => {
                // console.log('send hand prompt');
                client.emit(HAND_PROMPT, promptData);
            }, 0);
        }
    }
}

// 1) из реквеста создаем полноценный фрейм
// 2) в setup записываем setup.playSetup = new PlaySetup(если его там не было), и дальше всегда работаем с ним при поступлении реквестов.
getCurStreet = (isStrategy, rawActionList, isTerminal) => {
    const lastStreet = rawActionList[rawActionList.length - 1].street;
    return (isStrategy && isTerminal && lastStreet < 3) ? lastStreet + 1 : lastStreet;
};
isNeedCash = (isStrategy, rawActionList, isTerminal) => getCurStreet(isStrategy, rawActionList, isTerminal) >= enumPoker.enumPoker.perfomancePolicy.prepareCashStrategyStreet;
isNeedSimulation = (isStrategy, rawActionList, isTerminal) => getCurStreet(isStrategy, rawActionList, isTerminal) >= enumPoker.enumPoker.perfomancePolicy.startSimulationStreet;

const prompterListener = (setup, request, gameTypesSettings) => {
    // console.log('enter prompter listener');

    const {
        data,
        txtFile,
        client,
    } = request;

    const { id } = data;

    // check on valid recognition frame
    if (setup.playSetup === null) {
        setup.playSetup = new PlaySetup(gameTypesSettings);
        setup.playSetup.sessionSetup = setup;
    }
    setup.playSetup.client = client;
    setup.playSetup.id = id;
    setup.playSetup.txtFile = txtFile;

    const result = setup.playSetup.frameHandler(data, gameTypesSettings);

    if (result === STOP_PROMPT || result === REJECT_HAND) {
        // console.log(`stoped prompt: result === STOP_PROMPT`);

        if (setup.playSetup.stopPrompt) {
            setup.tasksQueue.clearIrrelevantTasks(setup.playSetup.handNumber);
        }

        if (client !== null) {
            const promptData = {
                prompt: {},
                id,
            };
            const handPromptData = {
                hand_prompt: {},
                id,
            };
            setTimeout(() => {
                // console.log('send empty prompt');
                client.emit(PROMPT, promptData);
                // console.log('send empty hand prompt');
                client.emit(HAND_PROMPT, handPromptData);
            }, 0);
        }

    } else if (result === PROMPT && !setup.playSetup.simulationsRequests[setup.playSetup.rawActionList.length]) {

        const {
            cash,
            handNumber,
            rawActionList,
            initPlayers,
            heroChair,
            bbSize,
        } = setup.playSetup;

        const isTerminal = setup.playSetup.isTerminalStreetState();
        const isActivePlayers = setup.playSetup.whoIsInGame().length > 1;
        const isValidStreetTerminal = setup.playSetup.isValidTerminalBoardState(isTerminal);
        if (isValidStreetTerminal && isActivePlayers) {
            setup.playSetup.simulationsRequests[setup.playSetup.rawActionList.length] = true;
            // console.log('send prompt to client');

            const hand = setup.playSetup.getHeroHand();
            const board = setup.playSetup.board.slice();
            const move_position = setup.playSetup.whoIsNextMove(isTerminal);
            const heroPosition = initPlayers[heroChair].enumPosition;
            const isHeroTurn = move_position === heroPosition;
            const move_id = rawActionList.length;
            const needCash = isNeedCash(true, rawActionList, isTerminal);
            const needSimulation = isNeedSimulation(true, rawActionList, isTerminal);
            const request = {
                handNumber,
                playSetup: setup.playSetup,
                rawActionList: rawActionList.slice(),
                initPlayers: initPlayers.slice(),
                BB: bbSize[bbSize.length - 1],
                board,
                cash,
                move_id,
                move_position,
                isHeroTurn,
                isTerminal,
                needCash,
                needSimulation,
                hand,
            };

            if (!needSimulation && isHeroTurn) {
                movesHandler.getHill(request, undefined, true);
            }

            if (needCash) {
                setup.tasksQueue.queueHandler(handNumber, rawActionList.length, request);
            }

            if (client !== null) {
                const prompt = Object.assign({ handNumber, move_id }, setup.playSetup.createMainPrompt(setup.playSetup.prevPlayFrame[setup.playSetup.prevPlayFrame.length - 1]));
                const promptData = {
                    prompt,
                    id,
                };

                setTimeout(() => {
                    // console.log('send prompt');
                    client.emit(PROMPT, promptData);
                }, 0);
            }
        }
    }
};

module.exports.prompterListener = prompterListener;


