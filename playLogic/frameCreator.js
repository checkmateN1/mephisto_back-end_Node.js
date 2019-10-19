const enumPoker = require('../enum');
const enumCommon = require('../enum');

const INVALID_FRAME = enumCommon.INVALID_FRAME;
const testRegions = [{'id': 1, 'Player0_name': 'iblj J et', 'Player1_name': 'Wacuum008', 'Player2_name': 'SoLucky', 'Player0_balance': '23,5 BB', 'Player1_balance': '23,5 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '2.0 BD', 'Player1_bet': '1,0 BB', 'Player2_bet': '', 'Pot': 'Pot 3,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9956691265106201}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 0, 'Player0_name': '', 'Player1_name': 'babrain', 'Player2_name': '', 'Player0_balance': '23,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': 'v', 'Player2_bet': '', 'Pot': 'Pot- 4,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'j', 'prob': 0.9999980926513672}, 'Card2_value': {'value': '2', 'prob': 1.0}, 'Card3_value': {'value': '3', 'prob': 0.9996916055679321}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9999970197677612}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'c', 'prob': 1.0}, 'Card2_suit': {'value': 's', 'prob': 0.9989612102508545}, 'Card3_suit': {'value': 'c', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': 'e', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 3, 'Player0_name': 'Posts BB', 'Player1_name': 'Vacuum008', 'Player2_name': '4iigin 8', 'Player0_balance': '21,0 BB', 'Player1_balance': '29,0 BB', 'Player2_balance': '23,5 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'a', 'prob': 1.0}, 'Player0_bet': '1,0 BB', 'Player1_bet': 'v', 'Player2_bet': '0,5 BB', 'Pot': 'Pot 1,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9891301393508911}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'j', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'a', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'd', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 's', 'prob': 0.9995007514953613}, 'betAmount': 'j', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 2, 'Player0_name': 'Fcld', 'Player1_name': 'gaeleto1_', 'Player2_name': 'So Lucky', 'Player0_balance': '24,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '24,5 BB', 'Player0_isActive': {'value': 'n', 'prob': 1.0}, 'Player1_isActive': {'value': 'n', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': '3,5 BB', 'Player2_bet': '', 'Pot': 'Pot3,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '.', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}];
const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regBalance = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regBеt = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regAllin = /all/i;

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

class Validator {
    constructor(playSetup) {
        this.handNumber = -1;
        this.prevHandNumber = -1;
        this.playSetup = playSetup;
        this.playersCount;
        this.heroChair;
        this.prevFrame = null;
    }

    createFrame(recFrame) {
        this.playersCount = enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].playersCount;
        this.heroChair = enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].heroChair;
        const dealers = Array(this.playersCount).fill().reduce((count, pl, i) => recFrame[`Player${i}_isDealer`].value === 'a' ? count + 1 : count, 0);

        if (enumPoker.cardsSuits.includes(recFrame[`Player${this.heroChair}_hole1_suit`].value)
            && enumPoker.cardsSuits.includes(recFrame[`Player${this.heroChair}_hole2_suit`].value)
            && enumPoker.cardsValues.includes(recFrame[`Player${this.heroChair}_hole1_value`].value)
            && enumPoker.cardsValues.includes(recFrame[`Player${this.heroChair}_hole2_value`].value)
            && dealers > 0) {
            // good frame

        } else {
            return INVALID_FRAME;
        }

        const isNewHand = this.checkNewHand(recFrame);
        if (this.playSetup.rejectHand && !isNewHand) {
            return INVALID_FRAME;
        }

        if (isNewHand && enumPoker.cardsSuits.includes(recFrame.Card1_suit.value)) {           // reject new hand with any board cards
            this.playSetup.rejectHand = true;
            return INVALID_FRAME;
        }

        this.validateFrame(recFrame, isNewHand);

        // после валидации при создании фрейма - смотрим кто сфолдил в rawActions и заполняем им валидный баланс из последнего баланса а ставки 0!
        const newHandNumer = this.getHandNumber();
        return recFrame;
    };

    validateFrame(recFrame, isNewHand) {
        const playerBalances = {};
        const playerBets = {};
        let unclearBalancesCount = 0;
        let unclearBetsCount = [];
        let dealersCount = 0;
        let activeCount = 0;

        Array(this.playersCount).fill().forEach((pl, i) => {
            if ((isNewHand && recFrame[`Player${i}_isActive`].value === 'a') ||
                (!isNewHand && this.playSetup.initPlayers[i] !== undefined && !this.playSetup.wasFoldBefore(i))) {

                const player_balance = `Player${i}_balance`;
                if (regAllin.test(recFrame[player_balance])) {
                    playerBalances[player_balance] = 0;
                } else {
                    const matchBalance = recFrame[player_balance].match(regBalance);
                    playerBalances[player_balance] = matchBalance ? +matchBalance[0]
                            .replace(/S/, 5)
                            .replace(/D/, 0)
                            .replace(/B/, 8)
                            .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                        : null;
                }

                const player_bet = `Player${i}_bet`;
                const matchBet = recFrame[player_bet].match(regBеt);
                playerBets[player_bet] = matchBet ? +matchBet[0]
                        .replace(/S/, 5)
                        .replace(/D/, 0)
                        .replace(/B/, 8)
                        .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                    : null;

                if (!this.isNumber(parseFloat(playerBalances[player_balance]))) {
                    playerBalances[player_balance] = 10000;
                    unclearBalancesCount++;
                }
                if (!this.isNumber(parseFloat(playerBets[player_bet]))) {
                    playerBets[player_bet] = 20000;
                    unclearBetsCount++;
                }
                if (recFrame[`Player${i}_isDealer`].value !== 'a') {
                    dealersCount++;
                }
                if (recFrame[`Player${i}_isActive`].value !== 'a') {
                    activeCount++;
                }
            }
        });

        const matchPot = recFrame.Pot.match(regPot);
        const pot = {
            Pot: matchPot ? +matchPot[0]
                    .replace(/S/, 5)
                    .replace(/D/, 0)
                    .replace(/B/, 8)
                    .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                : null,
        };

        const isPotNumber = this.isNumber(parseFloat(pot.Pot));
        if (isNewHand) {
            if (!unclearBalancesCount
                && !unclearBetsCount
                && isPotNumber
                && dealersCount === 1
                && activeCount > 1) {     // good first frame
                return Object.assign(recFrame, pot, playerBets, playerBalances);
            } else {
                return INVALID_FRAME;
            }
        } else {
            if (!isPotNumber) {
                pot.Pot = 30000;
            }

            const isNewStreet = this.isStreetChanged(recFrame);
            if (isNewStreet === undefined) {
                console.log('пропущенна одна или более улиц - отменяем попытку валидации');
                this.playSetup.rejectHand = true;
                return INVALID_FRAME;
            }

            const isTerminalStreetState = this.playSetup.isTerminalStreetState();

            if (isTerminalStreetState && !isNewStreet) {
                console.log('терминальное состояние и нету следующей карты - ждем следующую улицу');
                return INVALID_FRAME;
            }

            let isPotTruth;
            let isBalancesTruth;
            let isBetsTruth;

            // проверяем верный ли пот
            // 1) если сумма потерь всех балансов дает пот - верный пот и балансы! -> валидируем ставки
            // 2) если не вышло: если нету смены улицы: потери рав балансов в начале улицы плюс ставки = текущий пот! если не вышло - пот не верный!
                                 // проверяем что потеря балансов даст тот же пот, что и инит балансы + ставки, если да - сетим пот! Все остальное верно

                                // если есть смена улицы и не терминальное состояние: определяем макс ставку на прошлой улице - должны совпасть как минимум 2 потерянных баланса на пред улице
                                                    // если терминальное - у двоих или более должны совпасть потери - складываем потери балансов с потерями инит балансов + ставки

            // альтернатива: raw баланс с начала улицы + ставка любого игрока должен равняться текущей общей потере баланса - если нет, или баланс или ставка не верна
            // проверяем что из предположений соответствует реальности

            const balancesDiffArr = [];
            const bets = [];
            const balancesDiff = Array(this.playSetup.initPlayers.length).fill().reduce((balancesDiff, player, i) => {
                if (this.playSetup.initPlayers[i] !== undefined) {
                    if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                        const balaceDiff = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                        balancesDiffArr[i] = balaceDiff;
                        return balancesDiff + balaceDiff;
                    } else {
                        const balaceDiff = this.playSetup.initPlayers[i].initBalance - playerBalances[`Player${i}_balance`];
                        balancesDiffArr[i] = balaceDiff;
                        return balancesDiff + balaceDiff;
                    }
                } else {
                    return balancesDiff;
                }
            }, 0);

            if (pot.Pot === balancesDiff) {
                isPotTruth = true;
                isBalancesTruth = true;

                // валидируем и заменяем ставки
                if (!isNewStreet) {
                    balancesDiffArr.forEach((balance, i) => {
                        if (balance !== undefined) {
                            if (this.playSetup.wasFoldBefore(i) && this.playSetup.getLastValidMoveStreet(i) !== this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street) {
                                playerBets[`Player${i}_bet`] = 0;
                            } else {
                                playerBets[`Player${i}_bet`] = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - playerBalances[`Player${i}_balance`];
                            }
                        }
                    });
                } else if (!isTerminalStreetState) {
                    const currentMaxAmount = this.playSetup.maxAmountAtCurrentStreet();
                    const possibleMaxAmounts = [currentMaxAmount];
                    const possiblePlayers = [];
                    this.playSetup.initPlayers.reduce((maxAmount, player, i) => {
                        if (player !== undefined) {
                            if (!this.playSetup.wasFoldBefore(i)) {
                                const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                                possiblePlayers.push({ i, initBalance });

                                const newMax = initBalance - playerBalances[`Player${i}_balance`];
                                if (newMax > maxAmount) {
                                    possibleMaxAmounts.push(newMax);
                                    return newMax;
                                }
                            }
                        }
                        return maxAmount;
                    }, currentMaxAmount);

                    const isFoundValidBets = possibleMaxAmounts.reduce((isAlreadyFound, amount) => {
                        if (!isAlreadyFound) {
                            return possiblePlayers.reduce((isAlreadyFound, player) => {
                                if (!isAlreadyFound) {
                                    if (player.initBalance - playerBalances[`Player${player.i}_balance`]  === playerBets[`Player${player.i}_bet`] + amount) {
                                        // found right amount at previous street. Setting players bets
                                        balancesDiffArr.forEach((balance, i) => {
                                            if (balance !== undefined) {
                                                if (this.playSetup.wasFoldBefore(i)) {
                                                    playerBets[`Player${i}_bet`] = 0;
                                                } else {
                                                    playerBets[`Player${i}_bet`] = Math.max(player.initBalance - playerBalances[`Player${player.i}_balance`] - amount, 0);
                                                }
                                            }
                                        });
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } else {
                                    return true;
                                }
                            }, false);
                        } else {
                            return true;
                        }
                    }, false);

                    if (!isFoundValidBets) {
                        console.log('all bets are with mistake! But its ok with balances and pot. Invalid frame!');
                        return INVALID_FRAME;
                    }
                } else {        // new street and terminal state
                    
                }
            }
        }

    }

    isStreetChanged(recFrame) {
        if (this.playSetup.board.length === 0) {
            if (enumPoker.cardsSuits.includes(recFrame.Card3_suit.value)        // flop appeared
                && enumPoker.cardsSuits.includes(recFrame.Card3_value.value)
                && enumPoker.cardsSuits.includes(recFrame.Card2_suit.value)
                && enumPoker.cardsSuits.includes(recFrame.Card2_value.value)
                && enumPoker.cardsSuits.includes(recFrame.Card1_suit.value)
                && enumPoker.cardsSuits.includes(recFrame.Card1_value.value)) {
                if (!enumPoker.cardsSuits.includes(recFrame.Card4_suit.value)
                    && !enumPoker.cardsSuits.includes(recFrame.Card4_value.value)) {    // but not turn+
                    return true;
                } else {
                    return undefined;
                }
            } else {        // not all flop cards appeared or the is steel preflop
                return false;
            }
        } else if (this.playSetup.board.length === 3) {
            if (enumPoker.cardsSuits.includes(recFrame.Card4_suit.value)
                && enumPoker.cardsSuits.includes(recFrame.Card4_value.value)) {    // turn appeared
                if (!enumPoker.cardsSuits.includes(recFrame.Card5_suit.value)
                    && !enumPoker.cardsSuits.includes(recFrame.Card5_value.value)) {    // but not river
                    return true;
                } else {
                    return undefined;
                }
            }
        } else if (this.playSetup.board.length === 4) {
            if (enumPoker.cardsSuits.includes(recFrame.Card5_suit.value)
                && enumPoker.cardsSuits.includes(recFrame.Card5_value.value)) {    // river appeared
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    getHandNumber() {
        const newHandNumber = Math.floor(Math.random()*1000000000000000000000000);
        return newHandNumber !== this.playSetup.handNumber ? newHandNumber : this.getHandNumber();
    }

    checkNewHand(recFrame) {
        if (this.prevFrame === null) {
            return true;
        }

        // board
        const sumBoardCardsDiff = Array(5).fill().reduce((sum, card, i) => {
            return sum + ((this.prevFrame[`Card${i+1}_suit`].value !== 'None'
                || this.prevFrame[`Card${i+1}_value`].value !== 'None')
                && recFrame[`Card${i+1}_suit`].value === 'None') ? 1 : 0;
        }, 0);

        // dealer
        const isDealerMoved = Array(this.playersCount).fill().reduce((count, pl, i) => {
            return count + recFrame[`Player${i}_isDealer`].value !== this.prevFrame[`Player${i}_isDealer`].value ? 1 : 0;
        }, 0) === 2; // 2 - one disappeared and another one appeared

        // hero
        const isHeroCardsChanged = recFrame[`Player${this.heroChair}_hole1_suit`].value !== this.prevFrame[`Player${this.heroChair}_hole1_suit`].value  // one and more cards have changed
            || recFrame[`Player${this.heroChair}_hole1_value`].value !== this.prevFrame[`Player${this.heroChair}_hole1_value`].value
            || recFrame[`Player${this.heroChair}_hole2_suit`].value !== this.prevFrame[`Player${this.heroChair}_hole2_suit`].value
            || recFrame[`Player${this.heroChair}_hole2_value`].value !== this.prevFrame[`Player${this.heroChair}_hole2_value`].value;

        return sumBoardCardsDiff > 1 || (isHeroCardsChanged && isDealerMoved);
    }

    isNumber(value) {
        return typeof +value === 'number' && !isNaN(value);
    }
}

validatorCreator = (playSetup) => new Validator(playSetup);

const testFrameCreator = new Validator(testRegions[0]);



module.exports.validatorCreator = validatorCreator;







