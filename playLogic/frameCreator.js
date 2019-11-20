const enumPoker = require('../enum');
const enumCommon = require('../enum');

const INVALID_FRAME = enumCommon.enumCommon.INVALID_FRAME;
const testRegions = [{'id': 1, 'Player0_name': 'iblj J et', 'Player1_name': 'Wacuum008', 'Player2_name': 'SoLucky', 'Player0_balance': '23,5 BB', 'Player1_balance': '23,5 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '2.0 BD', 'Player1_bet': '1,0 BB', 'Player2_bet': '', 'Pot': 'Pot 3,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9956691265106201}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 0, 'Player0_name': '', 'Player1_name': 'babrain', 'Player2_name': '', 'Player0_balance': '23,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': 'v', 'Player2_bet': '', 'Pot': 'Pot- 4,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'j', 'prob': 0.9999980926513672}, 'Card2_value': {'value': '2', 'prob': 1.0}, 'Card3_value': {'value': '3', 'prob': 0.9996916055679321}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9999970197677612}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'c', 'prob': 1.0}, 'Card2_suit': {'value': 's', 'prob': 0.9989612102508545}, 'Card3_suit': {'value': 'c', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': 'e', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 3, 'Player0_name': 'Posts BB', 'Player1_name': 'Vacuum008', 'Player2_name': '4iigin 8', 'Player0_balance': '21,0 BB', 'Player1_balance': '29,0 BB', 'Player2_balance': '23,5 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'a', 'prob': 1.0}, 'Player0_bet': '1,0 BB', 'Player1_bet': 'v', 'Player2_bet': '0,5 BB', 'Pot': 'Pot 1,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9891301393508911}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'j', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'a', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'd', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 's', 'prob': 0.9995007514953613}, 'betAmount': 'j', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 2, 'Player0_name': 'Fcld', 'Player1_name': 'gaeleto1_', 'Player2_name': 'So Lucky', 'Player0_balance': '24,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '24,5 BB', 'Player0_isActive': {'value': 'n', 'prob': 1.0}, 'Player1_isActive': {'value': 'n', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': '3,5 BB', 'Player2_bet': '', 'Pot': 'Pot3,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '.', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}];
const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regBalance = /(S|D|B|\d)+\s{0,1}\d{0,2}(\.|\,){0,3}\d{0,1}/;
const regBеt = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regAllin = /(all|((4|A)(1|L|I)(1|L|I)-))/i;

class Player {
    constructor(id, adaptation) {
        this.id = id;
        this.adaptation = adaptation;
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
        this.playersCount = enumPoker.enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].playersCount;
        this.heroChair = enumPoker.enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].heroChair;
        const dealers = Array(this.playersCount).fill().reduce((count, pl, i) => recFrame[`Player${i}_isDealer`].value === 'a' ? count + 1 : count, 0);

        if (enumPoker.enumPoker.cardsSuits.includes(recFrame[`Player${this.heroChair}_hole1_suit`].value)
            && enumPoker.enumPoker.cardsSuits.includes(recFrame[`Player${this.heroChair}_hole2_suit`].value)
            && enumPoker.enumPoker.cardsValues.includes(recFrame[`Player${this.heroChair}_hole1_value`].value)
            && enumPoker.enumPoker.cardsValues.includes(recFrame[`Player${this.heroChair}_hole2_value`].value)
            && dealers > 0) {
            // good frame

        } else {
            return INVALID_FRAME;
        }

        const isNewHand = this.checkNewHand(recFrame);
        if (this.playSetup.rejectHand && !isNewHand) {
            return INVALID_FRAME;
        }

        if (isNewHand && enumPoker.enumPoker.cardsSuits.includes(recFrame.Card1_suit.value)) {           // reject new hand with any board cards
            this.playSetup.rejectHand = true;
            return INVALID_FRAME;
        }

        const validFrame = this.validateFrame(recFrame, isNewHand);

        if (validFrame === INVALID_FRAME) {
            return INVALID_FRAME;
        } else {
            // создаем фрейм
            const playPlayers = [];

            Array(this.playersCount).fill().forEach((pl, i) => {
                const nickname = validFrame[`Player${i}_name`];
                const balance = validFrame[`Player${i}_balance`];
                const bet = validFrame[`Player${i}_bet`];
                const isActive = validFrame[`Player${i}_isActive`].value === 'a';
                const isDealer = validFrame[`Player${i}_isDealer`].value === 'a';
                const cards = {
                    hole1Value: validFrame[`Player${i}_hole1_value`].value,
                    hole2Value: validFrame[`Player${i}_hole2_value`].value,
                    hole1Suit: validFrame[`Player${i}_hole1_suit`].value,
                    hole2Suit: validFrame[`Player${i}_hole2_suit`].value,
                };
                playPlayers[i] = new PlayPlayer(nickname, i, balance, bet, isActive, isDealer, cards);
            });

            const newHandNumber = isNewHand ? this.getHandNumber() : this.playSetup.handNumber;
            const board = [];  // если не распознана масть или номинал - присваиваем undefined элементу массива(карте)
                               // так же удаляем все undefined c правого конца

            Array(5).fill().forEach((card, i) => {
                const isValid = enumPoker.enumPoker.cardsSuits.includes(validFrame[`Card${i+1}_suit`].value)
                    && enumPoker.enumPoker.cardsValues.includes(validFrame[`Card${i+1}_value`].value);

                board[i] = isValid ? {
                    value: validFrame[`Card${i+1}_value`].value,
                    suit: validFrame[`Card${i+1}_suit`].value,
                } : undefined;
            });

            let cutCount = 0;
            board.reduceRight((isFoundValid, card) => {
                if (!isFoundValid) {
                    if (card) {
                        return true;
                    } else {
                        cutCount++;
                    }
                }
                return isFoundValid;
            }, false);

            while (cutCount) {
                board.pop();
                cutCount--;
            }

            const isButtons = validFrame.isFold.value;
            const playFrame = new PlayFrame(newHandNumber, validFrame.Pot, playPlayers, board, isButtons, this.heroChair);
            console.log('playFrame');
            console.log(playFrame);

            return playFrame;
        }
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
                            .replace(/(\s{1,2})*(?=(\d{0,2}(?=(\.|\,))))/, '')
                            .replace(/(\.|\,|\s)+(?=(\d)){0,1}/, '.')
                        : null;
                }

                const player_bet = `Player${i}_bet`;
                const matchBet = recFrame[player_bet].match(regBеt);
                playerBets[player_bet] = matchBet ? +matchBet[0]
                        .replace(/S/, 5)
                        .replace(/D/, 0)
                        .replace(/B/, 8)
                        .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                    : 0;

                if (!this.isNumber(parseFloat(playerBalances[player_balance]))) {
                    playerBalances[player_balance] = 10000;
                    unclearBalancesCount++;
                }
                if (!this.isNumber(parseFloat(playerBets[player_bet]))) {
                    playerBets[player_bet] = 0;
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
                : 0,
        };

        const isPotNumber = this.isNumber(parseFloat(pot.Pot));
        if (isNewHand) {
            if (!unclearBalancesCount
                && !unclearBetsCount
                && isPotNumber
                && pot.Pot > 0
                && dealersCount === 1
                && activeCount > 1) {     // good first frame
                return Object.assign(recFrame, pot, playerBets, playerBalances);
            } else {
                return INVALID_FRAME;
            }
        } else {        // not new hand
            if (!isPotNumber) {
                pot.Pot = 0;
            }

            const isNewStreet = this.isStreetChanged(recFrame);
            const currentStreet = this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street;
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

            const balancesDiffArr = [];
            const bets = [];
            const balancesDiff = this.playSetup.initPlayers.reduce((balancesDiff, player, i) => {
                if (this.playSetup.initPlayers[i] !== undefined) {
                    if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                        balancesDiffArr[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                        return balancesDiff + balancesDiffArr[i];
                    } else {
                        balancesDiffArr[i] = this.playSetup.initPlayers[i].initBalance - playerBalances[`Player${i}_balance`];
                        return balancesDiff + balancesDiffArr[i];
                    }
                } else {
                    return balancesDiff;
                }
            }, 0);

            if (pot.Pot === balancesDiff) {
                // валидируем и заменяем ставки
                if (!isNewStreet) {
                    balancesDiffArr.forEach((balance, i) => {
                        if (balance !== undefined) {
                            if (this.playSetup.wasFoldBefore(i)) {
                                playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveAmount(i);
                            } else {
                                playerBets[`Player${i}_bet`] = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - playerBalances[`Player${i}_balance`];
                            }
                        }
                    });
                } else if (!isTerminalStreetState) {
                    const currentMaxAmount = this.playSetup.maxAmountAtCurrentStreet();
                    const possibleMaxAmounts = [currentMaxAmount];
                    const possiblePlayers = [];
                    let validAmount;
                    this.playSetup.initPlayers.forEach((player, i) => {
                        if (player !== undefined) {
                            if (!this.playSetup.wasFoldBefore(i)) {
                                const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                                possiblePlayers.push({ i, initBalance });

                                const  amount = initBalance - playerBalances[`Player${i}_balance`] + playerBets[`Player${player.i}_bet`];
                                if (possibleMaxAmounts.includes(amount)) {
                                    validAmount = amount;
                                }
                            }
                        }
                    });

                    const isFoundValidBets = possibleMaxAmounts.reduce((isAlreadyFound, amount) => {
                        if (!isAlreadyFound) {
                            return possiblePlayers.reduce((isAlreadyFound, player) => {
                                if (!isAlreadyFound) {
                                    if ((player.initBalance - playerBalances[`Player${player.i}_balance`]  === playerBets[`Player${player.i}_bet`] + amount)
                                    && (playerBalances[`Player${player.i}_balance`] > 0 || playerBets[`Player${player.i}_bet`] > 0)) {
                                        // found right amount at previous street. Setting players bets
                                        balancesDiffArr.forEach((balance, i) => {
                                            if (balance !== undefined) {
                                                if (this.playSetup.wasFoldBefore(i)) {
                                                    playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveStreet(i) === currentStreet ? this.playSetup.getLastValidMoveAmount(i) : 0;
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
                    const maxAmount = this.playSetup.maxAmountAtCurrentStreet();
                    this.playSetup.initPlayers.forEach((player, i) => {
                        if (player !== undefined) {
                            if (this.playSetup.wasFoldBefore(i)) {
                                playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveAmount(i);
                            } else {
                                playerBets[`Player${i}_bet`] = Math.max(this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - playerBalances[`Player${i}_balance`] - maxAmount, 0);
                            }
                        }
                    });
                }
            } else {        // pot or balances are wrong
                if (!isNewStreet) {
                    const balancesDiffArrBets = [];
                    const balancesDiffByBets = this.playSetup.initPlayers.reduce((balancesDiff, player, i) => {
                        if (this.playSetup.initPlayers[i] !== undefined) {
                            if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                                balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                                return balancesDiff + balancesDiffArrBets[i];
                            } else {
                                balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) + playerBets[`Player${i}_bet`];
                                return balancesDiff + balancesDiffArrBets[i];
                            }
                        } else {
                            return balancesDiff;
                        }
                    }, 0);

                    if (pot.Pot === balancesDiffByBets) {     // pot and bets are correct
                        this.playSetup.initPlayers.forEach((player, i) => {
                            if (player !== undefined) {
                                playerBalances[`Player${i}_balance`] = this.playSetup.initPlayers[i].initBalance - balancesDiffArrBets[i];
                            }
                        });
                    } else if (balancesDiff === balancesDiffByBets) {       // balances and bets are correct
                        pot.Pot = balancesDiff;
                    } else {
                        console.log('2 or more mistakes in bets, balances or pot. Invalid frame');
                        return INVALID_FRAME;
                    }
                } else {        // new street and wrong pot or balances
                    if (!isTerminalStreetState) {
                        // предполагаем что ставки и балансы верны
                        // если они верны, то прирост балансов с начала улицы будет равен ставкам + совпавшими амаунтами
                        // возвращаем все ставки и должны совпасть как минимум 2 потери баланса = это и есть максАмаунт!! (еще могут быть те кто в олыне)
                        // ставки и балансы у этих игроков верны

                        // если не совпали 2 и более максАмаунтов - предполагаем, что верны пот и ставки
                        // возвращаем ставки и уменьшаем пот до терминального, пытаемся вычислить кто из игроков сколько вложил в пот на улице
                        // и ищем подтвержения этому в совпавших балансе + ставке с амаутом вычисленным из прироста пота на улице
                        const currentMaxAmount = this.playSetup.maxAmountAtCurrentStreet();
                        const possibleMaxAmounts = {};
                        let maxAmount;
                        this.playSetup.initPlayers.reduce((isFound, player, i) => {
                            if (!isFound && player !== undefined) {
                                if (!this.playSetup.wasFoldBefore(i)
                                || this.playSetup.getLastValidMoveStreet(i) === currentStreet) {
                                    const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                                    const amount = initBalance - playerBalances[`Player${i}_balance`] - playerBets[`Player${i}_bet`];
                                    if (!(amount in possibleMaxAmounts)) {
                                        possibleMaxAmounts[amount] = initBalance - amount > 0;
                                    } else {
                                        if (!possibleMaxAmounts[amount] || initBalance - amount > 0) {
                                            maxAmount = amount; // bingo!
                                            return true;
                                        }
                                    }
                                }
                            }
                            return isFound;
                        }, false);

                        if (maxAmount !== undefined) {
                            // знаем макс амаунт и можем проверить пот или все балансы по ставкам + амаунт, а затем установить всем валидные балансы или пот
                            // определяем кто сфолдил между фреймами и высчитываем для него возможные места фолда
                            const foldChair = this.getFoldedChair(recFrame);

                            if (foldChair !== undefined) {  // found one folded player
                                // create an arr with possible maxAmounts
                                const maxBalancesDiffWhenFolded = [];
                                const foldedPlayerBetAtNewStreet = playerBets[`Player${foldChair}_bet`];
                                if (!foldedPlayerBetAtNewStreet && this.playSetup.getLastValidMoveAmount(foldChair) < currentMaxAmount) {
                                    maxBalancesDiffWhenFolded.push(currentMaxAmount);
                                }
                                if (!foldedPlayerBetAtNewStreet && maxAmount > currentMaxAmount) {
                                    maxBalancesDiffWhenFolded.push(maxAmount);
                                }

                                // формируем и сортируем массив со ставками
                                this.playSetup.initPlayers.forEach((player, i) => {
                                    if (player !== undefined) {
                                        if (!this.playSetup.wasFoldBefore(i) && i !== foldChair) {  // folded between frames
                                            if (playerBets[`Player${i}_bet`] > foldedPlayerBetAtNewStreet) {
                                                maxBalancesDiffWhenFolded.push(playerBets[`Player${i}_bet`] + maxAmount);
                                            }
                                        }
                                    }
                                });

                                let validBalanceDiffForFoldedPlayer;
                                const balancesDiffArrBets = [];
                                maxBalancesDiffWhenFolded.reduce((isFound, foldedBalanceDiff) => {
                                    if (!isFound) {
                                        const balancesDiffByBets = this.playSetup.initPlayers.reduce((balancesDiff, player, i) => {
                                            if (this.playSetup.initPlayers[i] !== undefined) {
                                                if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                                                    balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                                                    return balancesDiff + balancesDiffArrBets[i];
                                                } else if (i === foldChair) {

                                                    balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) + foldedBalanceDiff;
                                                    return balancesDiff + balancesDiffArrBets[i];
                                                } else {
                                                    balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) + maxAmount + playerBets[`Player${i}_bet`];
                                                    return balancesDiff + balancesDiffArrBets[i];
                                                }
                                            } else {
                                                return balancesDiff;
                                            }
                                        }, 0);

                                        if (balancesDiffByBets === pot.Pot) {   // found call sizing for  + pot and bets are valid!
                                            validBalanceDiffForFoldedPlayer = foldedBalanceDiff;
                                            return true;
                                        }
                                        return false;
                                    } else {
                                        return true;
                                    }
                                }, false);

                                if (validBalanceDiffForFoldedPlayer !== undefined) {
                                    // беты и пот валидные, а так же максАмаунт и размер вложений того кто сфолдил
                                    this.playSetup.initPlayers.forEach((player, i) => {
                                        if (player !== undefined) {
                                            playerBalances[`Player${i}_balance`] = this.playSetup.initPlayers[i].initBalance - balancesDiffArrBets[i];
                                        }
                                    });
                                } else {
                                    console.log(`был найден предположительный максАмаунт на предыдущей улице: ${maxAmount}, но либо пот либо ставки не верны`);
                                    return INVALID_FRAME;
                                }
                            } else {
                                // no one folded between frames and we have maxAmount
                                const balancesDiffArrBets = [];
                                const balancesDiffByBets = this.playSetup.initPlayers.reduce((balancesDiff, player, i) => {
                                    if (this.playSetup.initPlayers[i] !== undefined) {
                                        if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                                            balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                                            return balancesDiff + balancesDiffArrBets[i];
                                        } else {
                                            balancesDiffArrBets[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) + maxAmount + playerBets[`Player${i}_bet`];
                                            return balancesDiff + balancesDiffArrBets[i];
                                        }
                                    } else {
                                        return balancesDiff;
                                    }
                                }, 0);

                                if (balancesDiffByBets === pot.Pot) {
                                    // заменяем все балансы используя ставки и balancesDiffArrBets;
                                    this.playSetup.initPlayers.forEach((player, i) => {
                                        if (this.playSetup.initPlayers[i] !== undefined) {
                                            playerBalances[`Player${i}_balance`] = this.playSetup.initPlayers[i].initBalance - balancesDiffArrBets[i];
                                        }
                                    });
                                } else if (balancesDiffByBets === balancesDiff) {
                                    pot.Pot = balancesDiff;
                                } else {
                                    console.log(`был найден предположительный максАмаунт на предыдущей улице: ${maxAmount}, возможно 2 или более цифры не верны`);
                                    return INVALID_FRAME;
                                }
                            }

                        } else {
                            // возможно балансы не верны, но возможно верны ставки - пытаемся определить амаунт из прироста пота за улицу
                            // const amountAVG = this.playSetup.initPlayers.reduce((pot, player, i) => {
                            //     return pot - (this.playSetup.initPlayers[i] === undefined || this.playSetup.wasFoldBefore(i)) ? 0 : playerBets[`Player${i}_bet`];
                            // }, pot.Pot) - this.playSetup.getPotStartStreet();  // potDiff at last street
                            //
                            // // 2) не забываем про олынеров коротких
                            // // 3) проверяем сколько вложили те, кто уже сфолдил на этой улице
                            //
                            // const notActivePlayers = [];
                            // const playerAmounts = [];       // !! amounts for all players
                            // const amountAvgActive = this.playSetup.initPlayers.reduce((pot, player, i) => {
                            //     if (this.playSetup.initPlayers[i] !== undefined) {
                            //         if (this.playSetup.wasFoldBefore(i)) {
                            //             const balDiff = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - this.playSetup.getLastValidMoveBalance(i);
                            //             notActivePlayers.push(i);
                            //             playerAmounts[i] = balDiff;
                            //             return pot - balDiff;
                            //         } else {
                            //             const endBalance = this.playSetup.getLastValidMoveBalance(i);
                            //             const balDiff = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - endBalance;
                            //             if (balDiff && endBalance === 0) {      // player went to allin at current street
                            //                 notActivePlayers.push(i);
                            //                 playerAmounts[i] = balDiff;
                            //                 return pot - balDiff;
                            //             }
                            //         }
                            //     }
                            //     return pot;
                            // }, amountAVG);
                            //
                            //
                            // const foldChair = this.getFoldedChair(recFrame);
                            // let foldAmount;
                            // if (foldChair !== undefined) {  // somebody folded between frames
                            //     // 1) проверяем что фолдун не колил макс амаунт
                            //     const foldOnCurrMaxAmountAmount = this.playSetup.getPrevAmountOnCurStreet(foldChair);
                            //
                            //     // предполагаем, что он сфолдил на макс амаунт и больше никто не повышал
                            //     notActivePlayers.push(foldChair);
                            //     foldAmount = foldOnCurrMaxAmountAmount < currentMaxAmount ? foldOnCurrMaxAmountAmount : currentMaxAmount;
                            //     playerAmounts[foldChair] = foldAmount;
                            // }
                            //
                            // const amountAvgActiveWithoutFolder = amountAvgActive - foldAmount || 0;
                            //
                            // const activePlayers = [];
                            // const initBalances = [];
                            // this.playSetup.initPlayers.forEach((player, i) => {
                            //     if (player !== undefined && !notActivePlayers.includes(i)) {
                            //         const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                            //         initBalances.push(initBalance);
                            //         activePlayers[i] = initBalance;
                            //     }
                            // });
                            //
                            // const activePlayersTMP = activePlayers.slice();
                            //
                            // initBalances.sort((a, b) => a - b);
                            // const sortedActivePlayers = initBalances.map(balance => {
                            //     const playerIndex = activePlayersTMP.indexOf(balance);
                            //     activePlayersTMP[playerIndex] = undefined;
                            //     return { playerIndex, balance };
                            // });
                            //
                            // const amountsActivePlayers = [];
                            // sortedActivePlayers.reduce((playersRestCount, player) => {
                            //     const terminalAmount = (amountAvgActiveWithoutFolder - amountsActivePlayers.reduce((sum, cur) => sum + cur, 0))/playersRestCount;
                            //     amountsActivePlayers.push(Math.min(terminalAmount, player.balance));
                            //     return playersRestCount - 1;
                            // }, sortedActivePlayers.length);
                            //
                            // // проверяем есть ли в amountsActivePlayers минимум 2 самых больших макс амаунта
                            // let maxValidAmount;
                            // amountsActivePlayers.sort((a, b) => a - b);
                            // if (amountsActivePlayers.length > 2
                            //     && amountsActivePlayers[amountsActivePlayers.length - 1] === amountsActivePlayers[amountsActivePlayers.length - 2]) {
                            //     // проверяем что хотя бы у одного игрока совпал прирост амаунт + ставка с приростом его баланса относительно начала пред улицы
                            //
                            // }

                        }

                    } else {    // new street + terminal state and and wrong pot or balances
                        // проверяем совпадает ли пот - все ставки с терминальным потом.

                        const potByBets = this.playSetup.initPlayers.reduce((pot, player, i) => {
                            if (player !== undefined) {
                                return pot - this.playSetup.wasFoldBefore(i) ? 0 : playerBets[`Player${i}_bet`];
                            }
                            return pot;
                        }, pot.Pot);

                        const curRawPot = this.playSetup.getPot();

                        if (curRawPot === potByBets) {    // верный пот и ставки
                            this.playSetup.initPlayers.forEach((player, i) => {
                                if (player !== undefined) {
                                    if (this.playSetup.wasFoldBefore(i)) {
                                        playerBalances[`Player${i}_balance`] = this.playSetup.getLastValidMoveBalance(i);
                                    } else {
                                        playerBalances[`Player${i}_balance`] = this.playSetup.getLastValidMoveBalance(i) - playerBets[`Player${i}_bet`];
                                    }
                                }
                            });
                        } else {    // беты или пот не верны
                            // проверяем правильность балансов с бетами
                            const potByBetsRawPot = this.playSetup.initPlayers.reduce((pot, player, i) => {
                                if (player !== undefined) {
                                    return pot + this.playSetup.wasFoldBefore(i) ? 0 : playerBets[`Player${i}_bet`];
                                }
                                return pot;
                            }, curRawPot);
                            if (balancesDiff === potByBetsRawPot) {     // верны балансы и ставки
                                pot.Pot = balancesDiff;
                            } else {
                                console.log(`терминальное состояние. Пот и балансы не совпали, пот и ставки не совпали, беты и балансы не совпали`);
                                return INVALID_FRAME;
                            }
                        }
                    }
                }
            }
        }
        return Object.assign(recFrame, pot, playerBets, playerBalances);
    }

    getFoldedChair(recFrame) {
        let foldChair;
        this.playSetup.initPlayers.reduce((isFound, player, i) => {
            if (!isFound) {
                if (player !== undefined) {
                    if (!this.playSetup.wasFoldBefore(i) && recFrame[`Player${i}_isActive`].value === 'n') {  // folded between frames
                        foldChair = i;
                        return true;
                    }
                }
            }
            return isFound;
        }, false);
        return foldChair;
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

const validatorCreator = (playSetup) => new Validator(playSetup);

const testFrameCreator = new Validator(testRegions[0]);



module.exports.validatorCreator = validatorCreator;







