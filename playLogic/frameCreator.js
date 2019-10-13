const enumPoker = require('../enum');

const testRegions = [{'id': 1, 'Player0_name': 'iblj J et', 'Player1_name': 'Wacuum008', 'Player2_name': 'SoLucky', 'Player0_balance': '23,5 BB', 'Player1_balance': '23,5 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '2.0 BD', 'Player1_bet': '1,0 BB', 'Player2_bet': '', 'Pot': 'Pot 3,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9956691265106201}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 0, 'Player0_name': '', 'Player1_name': 'babrain', 'Player2_name': '', 'Player0_balance': '23,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '25,0 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': 'v', 'Player2_bet': '', 'Pot': 'Pot- 4,0 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'n', 'prob': 1.0}, 'Player2_isDealer': {'value': 'a', 'prob': 1.0}, 'Card1_value': {'value': 'j', 'prob': 0.9999980926513672}, 'Card2_value': {'value': '2', 'prob': 1.0}, 'Card3_value': {'value': '3', 'prob': 0.9996916055679321}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9999970197677612}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'c', 'prob': 1.0}, 'Card2_suit': {'value': 's', 'prob': 0.9989612102508545}, 'Card3_suit': {'value': 'c', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': 'e', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 3, 'Player0_name': 'Posts BB', 'Player1_name': 'Vacuum008', 'Player2_name': '4iigin 8', 'Player0_balance': '21,0 BB', 'Player1_balance': '29,0 BB', 'Player2_balance': '23,5 BB', 'Player0_isActive': {'value': 'a', 'prob': 1.0}, 'Player1_isActive': {'value': 'a', 'prob': 1.0}, 'Player2_isActive': {'value': 'a', 'prob': 1.0}, 'Player0_bet': '1,0 BB', 'Player1_bet': 'v', 'Player2_bet': '0,5 BB', 'Pot': 'Pot 1,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 0.9891301393508911}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'j', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'a', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'd', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 's', 'prob': 0.9995007514953613}, 'betAmount': 'j', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}, {'id': 2, 'Player0_name': 'Fcld', 'Player1_name': 'gaeleto1_', 'Player2_name': 'So Lucky', 'Player0_balance': '24,0 BB', 'Player1_balance': '23,0 BB', 'Player2_balance': '24,5 BB', 'Player0_isActive': {'value': 'n', 'prob': 1.0}, 'Player1_isActive': {'value': 'n', 'prob': 1.0}, 'Player2_isActive': {'value': 'n', 'prob': 1.0}, 'Player0_bet': '', 'Player1_bet': '3,5 BB', 'Player2_bet': '', 'Pot': 'Pot3,5 BB', 'Player0_isDealer': {'value': 'n', 'prob': 1.0}, 'Player1_isDealer': {'value': 'a', 'prob': 1.0}, 'Player2_isDealer': {'value': 'n', 'prob': 1.0}, 'Card1_value': {'value': 'None', 'prob': 1.0}, 'Card2_value': {'value': 'None', 'prob': 1.0}, 'Card3_value': {'value': 'None', 'prob': 1.0}, 'Card4_value': {'value': 'None', 'prob': 1.0}, 'Card5_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_value': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_value': {'value': 'None', 'prob': 1.0}, 'Card1_suit': {'value': 'None', 'prob': 1.0}, 'Card2_suit': {'value': 'None', 'prob': 1.0}, 'Card3_suit': {'value': 'None', 'prob': 1.0}, 'Card4_suit': {'value': 'None', 'prob': 1.0}, 'Card5_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player0_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player1_hole2_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole1_suit': {'value': 'None', 'prob': 1.0}, 'Player2_hole2_suit': {'value': 'None', 'prob': 1.0}, 'betAmount': '.', 'isRaise': {'value': 'False', 'prob': 1.0}, 'isBet': {'value': 'False', 'prob': 1.0}, 'isCall': {'value': 'False', 'prob': 1.0}, 'isCheck': {'value': 'False', 'prob': 1.0}, 'isFold': {'value': 'False', 'prob': 1.0}}];
const regPot = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regBalance = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
const regBеt = /(S|D|B|\d)+(?!\S){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;

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
            // useful frame

        } else {
            return false;
        }

        const isNewHand = this.checkNewHand(recFrame);
        if (this.playSetup.rejectHand && !isNewHand) {
            return false;
        }

        if (isNewHand && enumPoker.cardsSuits.includes(recFrame.Card1_suit.value)) {           // reject new hand with board cards
            this.playSetup.rejectHand = true;
            return false;
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
        let unclearBetsCount = 0;
        let dealersCount = 0;
        let activeCount = 0;
        Array(this.playersCount).fill().forEach((pl, i) => {
            if ((isNewHand && recFrame[`Player${i}_isActive`].value === 'a') ||
                (!isNewHand && this.playSetup.initPlayers[i] !== undefined && !this.playSetup.wasFoldBefore(i))) {
                const player_balance = `Player${i}_balance`;
                const player_bet = `Player${i}_bet`;
                const matchBalance = recFrame[player_balance].match(regBalance);
                playerBalances[player_balance] = matchBalance ? +matchBalance[0]
                        .replace(/S/, 5)
                        .replace(/D/, 0)
                        .replace(/B/, 8)
                        .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                    : null;

                const matchBet = recFrame[player_bet].match(regBеt);
                playerBets[player_bet] = matchBet ? +matchBet[0]
                        .replace(/S/, 5)
                        .replace(/D/, 0)
                        .replace(/B/, 8)
                        .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')
                    : null;

                if (this.isNumber(parseFloat(playerBalances[player_balance]))) {
                    unclearBalancesCount++;
                }
                if (this.isNumber(parseFloat(playerBets[player_bet]))) {
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

        if (isNewHand) {
            if (!unclearBalancesCount && !unclearBetsCount && this.isNumber(parseFloat(pot.Pot)) && dealersCount === 1 && ) {     // all numbers are clear and just one dealer and 2+ active

            } else {

            }
        }

        const frame = Object.assign(recFrame, {});
        console.log(`recFrame.Player0_balance: ${recFrame.Player0_balance}`);
    }

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







