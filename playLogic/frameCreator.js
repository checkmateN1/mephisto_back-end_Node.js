const uniqid = require('uniqid');

const enumPoker = require('../enum');
const enumCommon = require('../enum');

const INVALID_FRAME = enumCommon.enumCommon.INVALID_FRAME;
const regPot = /(S|D|\d)+(?!\s\d)((\.|\,){0,3}\d{1,2}){0,1}/;
const regBalance = /\d+\s{0,1}\d{0,2}(\.|\,){0,3}\d{0,2}/;
const regBet = /\d+(?!([A-Z])){0,4}((\.|\,){0,3}\d{1,2}){0,1}/;
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
        this.playSetup = playSetup;
        this.playersCount;
        this.playSetup.heroChair;
        this.prevFrame = null;
    }

    createFrame(rawFrame, playFrameId) {
        // console.log('frameCreator/// enter createFrame in validator. rawFrame:');
        // console.log(rawFrame);

        if (rawFrame.frameData === 'frameTest') {
            // console.log(`frameCreator/// createFrame: test empty frame from client. INVALID_FRAME`);
            return INVALID_FRAME;
        }
        this.playersCount = enumPoker.enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].playersCount;
        this.playSetup.heroChair = enumPoker.enumPoker.gameTypesSettings[this.playSetup.gameTypesSettings || 'Spin&Go'].heroChair;
        const dealers = Array(this.playersCount).fill().reduce((count, pl, i) => rawFrame[`Player${i}_isDealer`].value === 'y' ? (count + 1) : count, 0);

        // // console.log(`frameCreator/// this.playSetup.heroChair: ${this.playSetup.heroChair}, this.playersCount: ${this.playersCount}, dealers: ${dealers}`);

        // if (enumPoker.enumPoker.cardsSuits.includes(rawFrame[`Player${this.playSetup.heroChair}_hole1_suit`].value)
        //     && enumPoker.enumPoker.cardsSuits.includes(rawFrame[`Player${this.playSetup.heroChair}_hole2_suit`].value)
        //     && enumPoker.enumPoker.cardsValues.includes(rawFrame[`Player${this.playSetup.heroChair}_hole1_value`].value)
        //     && enumPoker.enumPoker.cardsValues.includes(rawFrame[`Player${this.playSetup.heroChair}_hole2_value`].value)
        //     && dealers > 0) {
        if (dealers > 0) {
            // good frame
            // // console.log('frameCreator/// createFrame: good frame!');
        } else {
            // console.log(`frameCreator/// createFrame: no dealer found or wrong hero hand. INVALID_FRAME`);
            return INVALID_FRAME;
        }

        const isNewHand = this.checkNewHand(rawFrame);
        // console.log(`frameCreator/// createFrame: isNewHand: ${isNewHand}, this.playSetup.rejectHand: ${this.playSetup.rejectHand}`);
        if (this.playSetup.rejectHand && !isNewHand) {
            // console.log(`this.playSetup.rejectHand/// INVALID_FRAME`);
            return INVALID_FRAME;
        }

        if (isNewHand && enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card1_suit.value)) {           // reject new hand with any board cards
            this.playSetup.rejectHand = true;
            // console.log(`frameCreator/// createFrame: New hand and see flop already. INVALID_FRAME`);
            return INVALID_FRAME;
        }

        const validFrame = this.validateFrame(rawFrame, isNewHand);
        this.prevFrame = rawFrame;

        if (validFrame === INVALID_FRAME) {
            // console.log('frameCreator/// invalid frame after validateFrame');
            return INVALID_FRAME;
        } else {
            // создаем фрейм
            const playPlayers = [];

            Array(this.playersCount).fill().forEach((pl, i) => {
                const hole1Value = validFrame[`Player${i}_hole1_value`].value === '10' ? 'T' : validFrame[`Player${i}_hole1_value`].value;
                const hole2Value = validFrame[`Player${i}_hole2_value`].value === '10' ? 'T' : validFrame[`Player${i}_hole2_value`].value;
                const hole1Suit = validFrame[`Player${i}_hole1_suit`].value;
                const hole2Suit = validFrame[`Player${i}_hole2_suit`].value;

                const isGoodCards = enumPoker.enumPoker.cardsValues.includes(hole1Value)
                    && enumPoker.enumPoker.cardsValues.includes(hole2Value)
                    && enumPoker.enumPoker.cardsSuits.includes(hole1Suit)
                    && enumPoker.enumPoker.cardsSuits.includes(hole2Suit);

                const seeCardsCount = (enumPoker.enumPoker.cardsValues.includes(hole1Value) ? 1 : 0)
                + (enumPoker.enumPoker.cardsValues.includes(hole2Value) ? 1 : 0)
                + (enumPoker.enumPoker.cardsSuits.includes(hole1Suit) ? 1 : 0)
                + (enumPoker.enumPoker.cardsSuits.includes(hole2Suit) ? 1 : 0);

                // const nickname = validFrame[`Player${i}_name`];
                const nickname = `player_${i}`;
                const balance = validFrame[`Player${i}_balance`];
                const bet = validFrame[`Player${i}_bet`];
                const isActive = validFrame[`Player${i}_isActive`].value === 'y' || (i === this.playSetup.heroChair && seeCardsCount > 2 && (!this.playSetup.wasFoldBefore(i) || isNewHand));
                const isDealer = validFrame[`Player${i}_isDealer`].value === 'y';
                const cards = isGoodCards ? {
                    hole1Value,
                    hole2Value,
                    hole1Suit,
                    hole2Suit,
                } : null;
                playPlayers[i] = new PlayPlayer(nickname, i, balance, bet, isActive, isDealer, cards);
            });
            // console.log(`frameCreator/// isNewHand: ${isNewHand}, this.playSetup.handNumber: ${this.playSetup.handNumber}`);
            const newHandNumber = isNewHand ? uniqid('', playFrameId) : this.playSetup.handNumber;
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

            const isButtons = validFrame.isFold.value === 'True';
            const playFrame = new PlayFrame(newHandNumber, validFrame.Pot, playPlayers, board, isButtons, this.playSetup.heroChair);
            // console.log('frameCreator/// playFrame');
            // console.log(playFrame);

            return playFrame;
        }
    };

    validateFrame(rawFrame, isNewHand) {
        // console.log('frameCreator/// enter validateFrame');
        const playerBalances = {};
        const playerBets = {};
        let unclearBalancesCount = 0;
        let dealersCount = 0;
        let activeCount = 0;
        let emptyChairs = [];   // хранит true/false в соответствующих номеру стула в начале новой руки

        Array(this.playersCount).fill().forEach((pl, i) => {
            const player_balance = `Player${i}_balance`;
            if (regAllin.test(rawFrame[player_balance])) {
                playerBalances[player_balance] = 0;
            } else {
                const clearBalance = rawFrame[player_balance].replace(/(?<=\d)(\s8B)/, ' BB').replace(/B(?=.*(?=\sBB))/, '8').replace(/(?<=\d[0-9])\s(?=\d)/, '.').replace(/(?<=\d{1,2}\.\d)\s(?=\d)/, '');
                const matchBalance = clearBalance.match(regBalance);
                playerBalances[player_balance] = matchBalance ? Math.round((+matchBalance[0]
                    .replace(/(\s{1,2})*(?=(\d{0,2}(?=(\.|\,))))/, '')
                    .replace(/\s(?=\d)/, '')
                    .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')) * 100)
                    : 0;
            }

            const player_bet = `Player${i}_bet`;
            const clearBet = rawFrame[player_bet].replace(/(?<=\d)\s(?=\d)/, '').replace(/(?<=\d\.)\s(?=\d)/, '').replace(/(?<=\d)(\s8B)/, ' BB');
            const matchBet = clearBet.match(regBet);
            playerBets[player_bet] = matchBet ? Math.round((+matchBet[0]
                    .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')) * 100)
                : 0;

            if (!this.isNumber(playerBets[player_bet])) {
                playerBets[player_bet] = 0;
            }
            // // console.log(`check empty chair in validator: isNewHand: ${isNewHand}, chair: ${i}, isNotDealer: ${rawFrame[`Player${i}_isDealer`].value !== 'y'}, isNotActive: ${rawFrame[`Player${i}_isActive`].value !== 'y'}, Math.round(playerBets[player_bet]) === 0 : ${Math.round(playerBets[player_bet]) === 0}`);
            const isEmptyChair = isNewHand && rawFrame[`Player${i}_isDealer`].value !== 'y' && rawFrame[`Player${i}_isActive`].value !== 'y' && playerBets[player_bet] === 0;
            emptyChairs[i] = isEmptyChair;

            if (!this.isNumber(playerBalances[player_balance])) {
                // если баланс не цифра и у игрока нету дилера и он не активен и новая рука и ставка не число - считаем стул пустым и не плюсуем к грязным балансам
                if (isEmptyChair) {
                    playerBalances[player_balance] = 0;
                } else {
                    // // console.log(`check for unclear balances/// Math.round(playerBalances[player_balance]): chair: ${i} ${Math.round(playerBalances[player_balance])} `);
                    unclearBalancesCount++;
                    playerBalances[player_balance] = 100000;
                }
            }
            // // console.log(`frameCreator/// rawFrame[\`Player${i}_isDealer\`].value: ${rawFrame[`Player${i}_isDealer`].value}`);
            if (rawFrame[`Player${i}_isDealer`].value === 'y') {
                dealersCount++;
            }
            // // console.log(`frameCreator/// rawFrame[\`Player${i}_isActive\`].value: ${rawFrame[`Player${i}_isActive`].value}`);
            if (rawFrame[`Player${i}_isActive`].value === 'y' || i === this.playSetup.heroChair) {
                activeCount++;
            }
            // console.log(`playerBalances[${i}]: ${playerBalances[player_balance]}, playerBets[${i}]: ${playerBets[player_bet]}`);
        });

        const number = rawFrame.Pot.match(/\d\d\.\d\d/);
        const clearPot = number ? number[0] : rawFrame.Pot.replace(/.*(?=P(0|o|O))/, '').replace(/(?<=\d)\s(?=\d(\.|\,))/, '').replace(/(?<=\d)(\s8B)/, ' BB').replace(/B(?=.*(?=\sBB))/, '8');   // убрали символы до слова Pot так как бывают цифры
        const matchPot = clearPot.match(regPot);
        const pot = {
            Pot: matchPot ? Math.round((+matchPot[0]
                    .replace(/S/, 5)
                    .replace(/D/, 0)
                    .replace(/(\.|\,)+(?=(\d)){0,1}/, '.')) * 100)
                : 0,
        };

        const isPotNumber = this.isNumber(pot.Pot);
        // console.log(`frameCreator/// unclearBalancesCount: ${unclearBalancesCount}, isPotNumber: ${isPotNumber}, pot.Pot: ${pot.Pot}, dealersCount: ${dealersCount}, activeCount: ${activeCount}`);
        const isPotBetsEqual = pot.Pot === Object.keys(playerBets).reduce((sum, bet) => sum + playerBets[bet], 0);

        //dismiss one frame for waiting async balance-bet-pot appearing
        let hashSum;
        if (this.playSetup.gameTypesSettings === 'Spin&Go' && isNewHand) {
            const balances = Object.keys(playerBalances).reduce((sum, player) => {
                return sum + playerBalances[player];
            }, 0);
            const diff = this.getMinHashSumDiff(pot.Pot + balances, enumPoker.enumPoker.gameTypesSettings['Spin&Go'].hashSum);
            const emptyChair = emptyChairs.indexOf(true);
            if (diff > 2) {
                // проверяем что сумма балансов и бетов = хэшу
                const bets = Object.keys(playerBets).reduce((sum, player) => {
                    return sum + playerBets[player];
                }, 0);
                const diffBets = this.getMinHashSumDiff(bets + balances, enumPoker.enumPoker.gameTypesSettings['Spin&Go'].hashSum);
                if (diffBets <= 2) {    // балансы и беты верны
                    pot.Pot = bets;
                } else {
                    // проверяем diff еще раз если пустой стул empty с неправильным пустым цифро-балансом
                    if (emptyChair !== -1) {
                        const balancesNew = Object.keys(playerBalances).reduce((sum, player, i) => sum + (i === emptyChair ? 0 : playerBalances[player]), 0);
                        const diffNew = this.getMinHashSumDiff(pot.Pot + balancesNew, enumPoker.enumPoker.gameTypesSettings['Spin&Go'].hashSum);
                        if (diffNew > 2) {
                            // console.log('frameCreator/// validator // wrong hash sum balances and pot not equal one of Spin&Go hash constants');
                            // console.log(`diff: ${diff}, diffNew: ${diffNew}, pot.Pot: ${pot.Pot}, balances: ${balances}`);
                            return INVALID_FRAME;
                        } else {
                            // console.log(`new hand and check hash blinds sum/// diffNew: ${diffNew}`);
                        }
                    } else {
                        // console.log('frameCreator/// validator // wrong hash sum balances and pot not equal one of Spin&Go hash constants');
                        // console.log(`diff: ${diff}, pot.Pot: ${pot.Pot}, balances: ${balances}`);
                        return INVALID_FRAME;
                    }
                }
            }
            // console.log(`new hand and check hash blinds sum/// diff: ${diff}`);
            hashSum = true;
        }

        if (isNewHand) {
            if (!unclearBalancesCount
                && isPotNumber
                && isPotBetsEqual
                && hashSum
                && dealersCount === 1
                && activeCount > 1) {     // good first frame
                // console.log('frameCreator/// good first frame');
                return Object.assign(rawFrame, pot, playerBets, playerBalances);
            } else {
                if (!isPotBetsEqual) {
                    let dealerPosition;
                    const playersWasActive = Array(this.playersCount).fill().map((player, i) => {
                        let isGoodCards;
                        if (i === this.playSetup.heroChair) {
                            const hole1Value = rawFrame[`Player${i}_hole1_value`].value;
                            const hole2Value = rawFrame[`Player${i}_hole2_value`].value;
                            const hole1Suit = rawFrame[`Player${i}_hole1_suit`].value;
                            const hole2Suit = rawFrame[`Player${i}_hole2_suit`].value;
                            isGoodCards = enumPoker.enumPoker.cardsValues.includes(hole1Value)
                                && enumPoker.enumPoker.cardsValues.includes(hole2Value)
                                && enumPoker.enumPoker.cardsSuits.includes(hole1Suit)
                                && enumPoker.enumPoker.cardsSuits.includes(hole2Suit);
                        }
                        const bet = playerBets[`Player${i}_bet`];
                        const isActive = rawFrame[`Player${i}_isActive`].value === 'y';
                        const isDealer = rawFrame[`Player${i}_isDealer`].value === 'y';
                        if (isDealer) {
                            dealerPosition = i;
                        }
                        if ((isActive || (i === this.playSetup.heroChair && isGoodCards)) || (!isActive && (isDealer || bet > 0))) {
                            return { bet, isDealer }
                        }
                    });

                    // console.log('playersWasActive');
                    // console.log(playersWasActive);

                    const activePlayersLength = playersWasActive.filter(player => player !== undefined).length;
                    if (activePlayersLength === 2) {        // ha
                        // делаем проверку, что хотя бы один блайнд соответствует правилам по сайзингу
                        let SB, BB;
                        const validBlind = playersWasActive.filter((player, i) => {
                            if (!player) {
                                return false;
                            }
                            if (player.bet === 50 && player.isDealer) {
                                SB = 50;
                            }
                            if (player.bet === 100 && !player.isDealer) {
                                BB = 100;
                            }
                            return player && (((player.bet === pot.Pot/3 || player.bet === 50) && player.isDealer) || ((player.bet === pot.Pot/1.5 || player.bet === 100) && !player.isDealer));
                        }).length;
                        if (!validBlind) {
                            // console.log('frameCreator/// validator // ha! can not find valid blind. Invalid frame');
                            return INVALID_FRAME;
                        }
                        if (SB && BB) {         // trying to fix wrong pot
                            pot.Pot = 150;
                        }
                        // console.log(`test SB BB/// SB: ${SB}, BB: ${BB}`);
                        playersWasActive.forEach((player, i) => {
                            if (player) {
                                if (player.isDealer) {
                                    if (player.bet !== 50 && BB === 100 && pot.Pot < 500) {
                                        SB = pot.Pot - BB;
                                        playerBets[`Player${i}_bet`] = SB;
                                    } else if (player.bet !== 50) {
                                        SB = pot.Pot/3;
                                        playerBets[`Player${i}_bet`] = SB;   // valid SB size
                                    }
                                } else {
                                    if (player.bet !== 100 && SB === 50 && pot.Pot < 500) {
                                        BB = pot.Pot - SB;
                                        playerBets[`Player${i}_bet`] = BB;
                                    } else if (player.bet !== 100) {
                                        BB = pot.Pot/150;
                                        playerBets[`Player${i}_bet`] = BB;   // valid BB size
                                    }
                                }
                            }
                        });
                        // console.log(`frameCreator/// validator // new artificial blinds// SB: ${SB}, BB: ${BB}`);
                    } else if (activePlayersLength > 2) {
                        // console.log(`dealerPosition: ${dealerPosition}, this.playersCount: ${this.playersCount}`);
                        if (dealerPosition !== undefined) {
                            let SBposition, BBposition;
                            this.playSetup.movesOrder(this.playersCount, dealerPosition, dealerPosition).forEach(chair => {
                                // console.log(`inside movesOrder /// chair: ${chair}`);
                                if (playersWasActive[chair]) {
                                    if (SBposition === undefined) {
                                        SBposition = chair;
                                    } else if (BBposition === undefined) {
                                        BBposition = chair;
                                    }
                                }
                            });

                            // console.log(`SBposition: ${SBposition}, BBposition: ${BBposition}`);
                            const betsRest = playersWasActive.reduce((sum, player, i) => {
                                if (player && i !== SBposition && i !== BBposition) {
                                    return sum + playerBets[`Player${i}_bet`];
                                }
                                return sum;
                            }, 0);


                            const validBlind = (playerBets[`Player${SBposition}_bet`] === (pot.Pot - betsRest)/3) || (playerBets[`Player${BBposition}_bet`] === (pot.Pot - betsRest)/1.5);
                            if (!validBlind) {
                                if (playerBets[`Player${SBposition}_bet`] === 50 && playerBets[`Player${BBposition}_bet`] === 100 && pot.Pot < 450 && betsRest > 0) {
                                    let position;
                                    const restBetterCount = playersWasActive.reduce((sum, player, i) => {
                                        if (player && i !== SBposition && i !== BBposition && playerBets[`Player${i}_bet`] > 0) {
                                            position = i;
                                            return sum + 1;
                                        }
                                        return sum;
                                    }, 0);
                                    if (restBetterCount === 1 && position !== undefined) {
                                        playerBets[`Player${position}_bet`] = pot.Pot - 150;   // BB + SB
                                    } else {
                                        // console.log('frameCreator/// validator // can not find valid not blind bets. Invalid frame');
                                        return INVALID_FRAME;
                                    }
                                } else {
                                    // console.log('frameCreator/// validator // 3 players+! can not find valid blind. Invalid frame');
                                    // console.log(`betsRest: ${betsRest}, playerBets[\`Player${SBposition}_bet\`]: ${playerBets[`Player${SBposition}_bet`]}, playerBets[\`Player${BBposition}_bet\`]: ${playerBets[`Player${BBposition}_bet`]}, (pot.Pot - betsRest)/1.5: ${(pot.Pot - betsRest)/1.5}`);
                                    return INVALID_FRAME;
                                }
                            } else {
                                playerBets[`Player${SBposition}_bet`] = (pot.Pot - betsRest)/3;
                                playerBets[`Player${BBposition}_bet`] = (pot.Pot - betsRest)/1.5;
                                // console.log(`frameCreator/// validator // new artificial blinds// SB: ${playerBets[`Player${SBposition}_bet`]}, BB: ${playerBets[`Player${BBposition}_bet`]}`);
                            }
                        } else {
                            // console.log('frameCreator/// validator // can not find dealer. Invalid frame');
                            return INVALID_FRAME;
                        }
                    } else {
                        // console.log('frameCreator/// validator // active players < 2. Invalid frame');
                        return INVALID_FRAME;
                    }

                    const isNewPotBetsEqual = pot.Pot === Object.keys(playerBets).reduce((sum, bet) => sum + playerBets[bet], 0);
                    if (!unclearBalancesCount
                        && isPotNumber
                        && isNewPotBetsEqual
                        && dealersCount === 1
                        && activeCount > 1) {     // good first frame with artificial blinds
                        // console.log('frameCreator/// good first frame with artificial blinds!');
                        return Object.assign(rawFrame, pot, playerBets, playerBalances);
                    } else {
                        // console.log('frameCreator/// bad first frame: pot and bets are equal but something else not');
                        return INVALID_FRAME;
                    }
                } else {
                    // console.log('frameCreator/// bad first frame: pot and bets are equal but something else not');
                    return INVALID_FRAME;
                }
            }
        } else {        // not new hand
            if (!isPotNumber) {
                pot.Pot = 0;
            }
            const isNewStreet = this.isStreetChanged(rawFrame);
            const currentStreet = this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street;
            const isTerminalStreetState = this.playSetup.isTerminalStreetState();
            // console.log(`frameCreator/// validator not new hand, isNewStreet: ${isNewStreet}, isTerminalStreetState: ${isTerminalStreetState}`);

            // if (isTerminalStreetState && !isNewStreet) {
            //     // console.log('frameCreator/// терминальное состояние и нету следующей карты - ждем следующую улицу');
            //     return INVALID_FRAME;
            // }

            const balancesDiffArr = [];
            const bets = [];
            const balancesDiff = this.playSetup.initPlayers.reduce((balancesDiff, player, i) => {
                if (this.playSetup.initPlayers[i] !== undefined) {
                    if (this.playSetup.wasFoldBefore(i)) {         // compare last move balance with init balance
                        // console.log(`inside balancesDiff/// player folded before! chair: ${i}, initBalance: ${this.playSetup.initPlayers[i].initBalance}, this.playSetup.getLastValidMoveBalance(i): ${this.playSetup.getLastValidMoveBalance(i)}`);
                        balancesDiffArr[i] = this.playSetup.initPlayers[i].initBalance - this.playSetup.getLastValidMoveBalance(i);
                        // console.log(`balancesDiff: ${balancesDiff}, balancesDiffArr[i]: ${balancesDiffArr[i]}`);
                        return balancesDiff + balancesDiffArr[i];
                    } else {
                        // console.log(`inside balancesDiff/// chair: ${i}, initBalance: ${this.playSetup.initPlayers[i].initBalance}`);
                        balancesDiffArr[i] = this.playSetup.initPlayers[i].initBalance - playerBalances[`Player${i}_balance`];
                        // console.log(`balancesDiff: ${balancesDiff}, balancesDiffArr[i]: ${balancesDiffArr[i]}`);
                        return balancesDiff + balancesDiffArr[i];
                    }
                } else {
                    return balancesDiff;
                }
            }, 0);

            // console.log(`frameCreator/// validator /// : pot.Pot: ${pot.Pot}, balancesDiff: ${balancesDiff}`);

            // if (pot.Pot === balancesDiff) {
            if (Math.abs(pot.Pot - balancesDiff) < 3) {
                // валидируем и заменяем ставки
                if (!isNewStreet) {
                    // console.log('frameCreator/// validator: pot and balances diff equal and not street changes');
                    balancesDiffArr.forEach((balance, i) => {
                        if (balance !== undefined) {
                            if (this.playSetup.wasFoldBefore(i)) {
                                playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveAmount(i);
                            } else {
                                // console.log(`this.playSetup.initPlayerBalance(this.playSetup.initPlayers[${i}].enumPosition)`);
                                // console.log(this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition));
                                // console.log(`playerBalances[\`Player${i}_balance\`]`);
                                // console.log(playerBalances[`Player${i}_balance`]);
                                playerBets[`Player${i}_bet`] = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - playerBalances[`Player${i}_balance`];
                            }
                        }
                    });
                } else if (!isTerminalStreetState) {
                    // console.log('frameCreator/// pot and balances diff equal and new street and not terminal state');
                    const currentMaxAmount = this.playSetup.maxAmountAtCurrentStreet();
                    const possibleMaxAmounts = [currentMaxAmount];
                    const possiblePlayers = [];
                    let validAmount;
                    this.playSetup.initPlayers.forEach((player, i) => {
                        if (player !== undefined) {
                            if (!this.playSetup.wasFoldBefore(i)) {
                                const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                                // console.log(`test init balances/// chair: ${i}, this.playSetup.initPlayers[i].enumPosition: ${this.playSetup.initPlayers[i].enumPosition}, this.playSetup.initPlayerBalance: ${this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition)}`);
                                possiblePlayers.push({ i, initBalance });

                                const  amount = initBalance - playerBalances[`Player${i}_balance`] - playerBets[`Player${i}_bet`];
                                // console.log(`inside playSetup.initPlayers.forEach /// chair: ${i}, initBalance: ${initBalance}, amount: ${amount}, playerBalances: ${playerBalances[`Player${i}_balance`]}, playerBets: ${playerBets[`Player${i}_bet`]}, `);
                                if (possibleMaxAmounts.includes(amount)) {
                                    validAmount = amount;
                                } else if (amount > currentMaxAmount) {
                                    possibleMaxAmounts.push(amount);
                                }
                            }
                        }
                    });

                    // console.log(`validAmount: ${validAmount}, currentMaxAmount: ${currentMaxAmount}, possibleMaxAmounts: ${possibleMaxAmounts}, possiblePlayers: ${possiblePlayers}`);

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
                                                    // // console.log(`inside possibleMaxAmounts/// chair: ${i}, this.playSetup.getLastValidMoveStreet(i) === currentStreet: ${this.playSetup.getLastValidMoveStreet(i) === currentStreet}, this.playSetup.getLastValidMoveAmount(i): ${this.playSetup.getLastValidMoveAmount(i)}`);
                                                    playerBets[`Player${i}_bet`] = 0;
                                                    // playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveStreet(i) === currentStreet ? this.playSetup.getLastValidMoveAmount(i) : 0;
                                                } else {
                                                    const initBalance = this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition);
                                                    // console.log(`inside possibleMaxAmounts/// chair: ${i}, initBalance: ${initBalance}, playerBalances[\`Player${i}_balance\`]: ${playerBalances[`Player${i}_balance`]}, amount: ${amount}`);
                                                    playerBets[`Player${i}_bet`] = Math.max(initBalance - playerBalances[`Player${i}_balance`] - amount, 0);
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
                        // console.log('frameCreator/// all bets are with mistake! But its ok with balances and pot. Invalid frame!');
                        return INVALID_FRAME;
                    }
                } else {        // new street and terminal state
                    const maxAmount = this.playSetup.maxAmountAtCurrentStreet();
                    this.playSetup.initPlayers.forEach((player, i) => {
                        if (player !== undefined) {
                            if (this.playSetup.wasFoldBefore(i)) {
                                // playerBets[`Player${i}_bet`] = this.playSetup.getLastValidMoveAmount(i);
                                playerBets[`Player${i}_bet`] = 0;
                            } else {
                                playerBets[`Player${i}_bet`] = Math.max(this.playSetup.initPlayerBalance(this.playSetup.initPlayers[i].enumPosition) - playerBalances[`Player${i}_balance`] - maxAmount, 0);
                            }
                        }
                    });
                }
            } else {        // pot or balances are wrong
                if (!isNewStreet) {
                    // асинхронное появление ставок и пота вслед за уменьшением баланса (сначала баланс а след фрейм ставка + пот)
                    // 1)проверяем: если вырос пот и у одно из активных игроков прирос бет на прирост (пота - прирост ставок относительно последних валидных)
                    // но баланс остался таким же как его последний валидный баланс
                    // 2) abc(бет + баланс) - (последние валидные бет + баланс) > 0

                    // 3) прирос пот но не изменились балансы и при этом хоть как-то изменился бет одного из игроков(скорее всего у него асинхронная ставка)
                    //
                    // if (!isNewHand) {
                    //     let isInvalidFrame;
                    //     const asyncCount = this.playSetup.initPlayers.forEach((player, i) => {
                    //         if (player !== undefined && !this.playSetup.wasFoldBefore(i)) {
                    //             const lastValidBalance = this.playSetup.getLastValidMoveBalance(i);
                    //             const lastValidAmount = this.playSetup.getLastValidMoveAmount(i);
                    //             const curBalance = playerBalances[`Player${i}_balance`];
                    //             const curAmount = playerBets[`Player${i}_bet`];
                    //
                    //             if (lastValidAmount === curAmount
                    //                 && lastValidBalance > curBalance) {
                    //                 // console.log(`dismiss 1 frame: async player invest detected!`);
                    //                 isInvalidFrame = true;
                    //             }
                    //         }
                    //     });
                    //     if (isInvalidFrame) {
                    //         return INVALID_FRAME;
                    //     }
                    //
                    //     // проверка и исправление баланса в прошлом
                    //
                    // }

                    // console.log(`enter trying to calculate pot or balances by bets and valid history`);
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

                    if (Math.abs(pot.Pot - balancesDiffByBets) < 3) {     // pot and bets are correct
                        // console.log(`pot or balances are wrong/// pot.Pot === balancesDiffByBets, setting new valid balances`);
                        this.playSetup.initPlayers.forEach((player, i) => {
                            if (player !== undefined) {
                                playerBalances[`Player${i}_balance`] = this.playSetup.initPlayers[i].initBalance - balancesDiffArrBets[i];
                            }
                        });
                    } else if (Math.abs(balancesDiff - balancesDiffByBets) < 3) {       // balances and bets are correct
                        pot.Pot = balancesDiff;
                    } else {
                        // console.log('frameCreator/// 2 or more mistakes in bets, balances or pot. Invalid frame');
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

                        // console.log(`enter trying to calculate pot or balances by bets and valid history// currentMaxAmount: ${currentMaxAmount}, possibleMaxAmounts: ${possibleMaxAmounts}`);

                        if (maxAmount !== undefined) {
                            // знаем макс амаунт и можем проверить пот или все балансы по ставкам + амаунт, а затем установить всем валидные балансы или пот
                            // определяем кто сфолдил между фреймами и высчитываем для него возможные места фолда
                            const foldChair = this.getFoldedChair(rawFrame);

                            // console.log(`maxAmount: ${maxAmount}, foldChair: ${foldChair}`);

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
                                    // console.log(`frameCreator/// был найден предположительный максАмаунт на предыдущей улице: ${maxAmount}, но либо пот либо ставки не верны`);
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

                                if (Math.abs(balancesDiffByBets - pot.Pot) < 3) {
                                    // заменяем все балансы используя ставки и balancesDiffArrBets;
                                    this.playSetup.initPlayers.forEach((player, i) => {
                                        if (this.playSetup.initPlayers[i] !== undefined) {
                                            playerBalances[`Player${i}_balance`] = this.playSetup.initPlayers[i].initBalance - balancesDiffArrBets[i];
                                        }
                                    });
                                } else if (Math.abs(balancesDiffByBets - balancesDiff) < 3) {
                                    pot.Pot = balancesDiff;
                                } else {
                                    // console.log(`frameCreator/// был найден предположительный максАмаунт на предыдущей улице: ${maxAmount}, возможно 2 или более цифры не верны`);
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
                            // const foldChair = this.getFoldedChair(rawFrame);
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
                                return pot - (this.playSetup.wasFoldBefore(i) ? 0 : playerBets[`Player${i}_bet`]);
                            }
                            return pot;
                        }, pot.Pot);

                        const curRawPot = this.playSetup.getPot();

                        if (Math.abs(curRawPot - potByBets) < 3) {    // верный пот и ставки
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
                                    return pot + (this.playSetup.wasFoldBefore(i) ? 0 : playerBets[`Player${i}_bet`]);
                                }
                                return pot;
                            }, curRawPot);
                            if (Math.abs(balancesDiff - potByBetsRawPot) < 3) {     // верны балансы и ставки
                                pot.Pot = balancesDiff;
                            } else {
                                // console.log(`frameCreator/// терминальное состояние. Пот и балансы не совпали, пот и ставки не совпали, беты и балансы не совпали`);
                                return INVALID_FRAME;
                            }
                        }
                    }
                }
            }
        }
        return Object.assign(rawFrame, pot, playerBets, playerBalances);
    }

    getFoldedChair(rawFrame) {
        let foldChair;
        this.playSetup.initPlayers.reduce((isFound, player, i) => {
            if (!isFound) {
                if (player !== undefined) {
                    if (!this.playSetup.wasFoldBefore(i) && rawFrame[`Player${i}_isActive`].value === 'n' && i !== this.playSetup.heroChair) {  // folded between frames
                        foldChair = i;
                        return true;
                    }
                }
            }
            return isFound;
        }, false);
        return foldChair;
    }

    getMinHashSumDiff(sum, hashesArr) {
        // console.log(`inside diff calculating// sum: ${sum}`);
        return hashesArr.reduce((epsilon, cur) => {
            const min = Math.abs(cur - sum);
            return min < epsilon ? min : epsilon;
        }, 100500);
    }

    isStreetChanged(rawFrame) {
        if (this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street === 0) {
            if (enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card3_suit.value)        // flop appeared
                && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card3_value.value)
                && enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card2_suit.value)
                && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card2_value.value)
                && enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card1_suit.value)
                && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card1_value.value)) {
                // console.log(`frameValidator /// isStreetChanged// // flop appeared`);
                if (enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card4_suit.value)
                    && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card4_value.value)) {
                    // console.log(`frameValidator /// isStreetChanged// // turn appeared`);
                }
                return true;
            } else {        // not all flop cards appeared or there is steel preflop
                return false;
            }
        } else if (this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street === 1) {
            if (enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card4_suit.value)
                && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card4_value.value)) {    // turn appeared
                // console.log(`frameValidator /// isStreetChanged// // turn appeared`);
                if (enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card5_suit.value)
                    && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card5_value.value)) {    // but not river
                    // console.log(`frameValidator /// isStreetChanged// // river appeared`);
                }
                return true;
            } else {
                return false;
            }
        } else if (this.playSetup.rawActionList[this.playSetup.rawActionList.length - 1].street === 2) {
            return enumPoker.enumPoker.cardsSuits.includes(rawFrame.Card5_suit.value)
                && enumPoker.enumPoker.cardsValues.includes(rawFrame.Card5_value.value);
        } else {
            return false;
        }
    };

    checkNewHand(rawFrame) {
        if (this.prevFrame === null) {
            // console.log(`frameCreator/// checkNewHand// this.prevFrame === null: ${this.prevFrame === null}`);
            return true;
        }

        // board
        const sumBoardCardsDiff = Array(5).fill().reduce((sum, card, i) => {
            return sum + (((this.prevFrame[`Card${i+1}_suit`].value !== 'None'
                || this.prevFrame[`Card${i+1}_value`].value !== 'None')
                && rawFrame[`Card${i+1}_suit`].value === 'None') ? 1 : 0);
        }, 0);

        // dealer
        const isDealerMoved = Array(this.playersCount).fill().reduce((count, pl, i) => {
            const isChanged = rawFrame[`Player${i}_isDealer`].value !== this.prevFrame[`Player${i}_isDealer`].value;
            return count + (isChanged ? 1 : 0);
        }, 0) === 2; // 2 - one disappeared and another one appeared

        let prevHeroHand = {};
        if (this.playSetup.initPlayers[this.playSetup.heroChair]) {
            prevHeroHand = this.playSetup.initPlayers[this.playSetup.heroChair].cards;
        } else {
            return true;
        }

        // hero
        const hole1_suit = rawFrame[`Player${this.playSetup.heroChair}_hole1_suit`].value;
        const hole1_suit_prob = rawFrame[`Player${this.playSetup.heroChair}_hole1_suit`].prob;
        const hole2_suit = rawFrame[`Player${this.playSetup.heroChair}_hole2_suit`].value;
        const hole2_suit_prob = rawFrame[`Player${this.playSetup.heroChair}_hole2_suit`].prob;
        const hole1_value = rawFrame[`Player${this.playSetup.heroChair}_hole1_value`].value;
        const hole1_value_prob = rawFrame[`Player${this.playSetup.heroChair}_hole1_value`].prob;
        const hole2_value = rawFrame[`Player${this.playSetup.heroChair}_hole2_value`].value;
        const hole2_value_prob = rawFrame[`Player${this.playSetup.heroChair}_hole2_value`].prob;

        const isHeroHand = hole1_suit !== 'None' && hole1_suit_prob > 0.85
            && hole2_suit !== 'None' && hole2_suit_prob > 0.85
            && hole1_value !== 'None' && hole1_value_prob > 0.85
            && hole2_value !== 'None' && hole2_value_prob > 0.85;

        const isHeroCardsChanged = hole1_suit !== (prevHeroHand ? prevHeroHand.hole1Suit : 'None')  // one and more cards have changed
            || hole1_value !== (prevHeroHand ? prevHeroHand.hole1Value : 'None')
            || hole2_suit !== (prevHeroHand ? prevHeroHand.hole2Suit : 'None')
            || hole2_value !== (prevHeroHand ? prevHeroHand.hole2Value : 'None');

        // console.log(`frameCreator/// checkNewHand// sumBoardCardsDiff: ${sumBoardCardsDiff}, isHeroCardsChanged: ${isHeroCardsChanged}, isDealerMoved: ${isDealerMoved}`);
        return (sumBoardCardsDiff > 1 || isHeroCardsChanged || isDealerMoved) && isHeroHand;
    }

    isNumber(value) {
        return typeof +value === 'number' && !isNaN(value);
    }
}

const validatorCreator = (playSetup) => new Validator(playSetup);

module.exports.validatorCreator = validatorCreator;







