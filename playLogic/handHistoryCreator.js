const enumPoker = require('../enum');

// проверяем балансы игроков в новых инит плеерсах.. тот у кого вырос баланс - тот выиграл. Смотрим его баланс
// проверяем было ли повышение относительно ходов rawActions используя getCallFoldPot in prompterHandler
    // если прирост пота победителя совпал - доколиваем и пушим в rawActions. Если нет - не сохраняем историю руки

// если нету шоудаунов, НО в течении 6сек началась новая валидная рука - считываем из инит пллерс балансы на соответствующих
// физических стульях и вы


const getValidHistory = (options) => {
  const {
    rawActions = [],
    isRejectHand,
    isTerminal,
    heroChair,
    initPlayers,
    newInitPlayers,
    playersHands,
  } = options;




  // возвращаем валидную историю руки в виде rawActions

};

class PlayFrame {
  constructor(handNumber, pot, playPlayers, board, isButtons, heroRecPosition, testNumber) {
    this.handNumber = handNumber;
    this.pot = pot;
    this.playPlayers = playPlayers;   // []  index == chair
    this.board = board;         // []
    this.isButtons = isButtons;
    this.heroRecPosition = heroRecPosition;       // 2 for spin&go
    this.testNumber = testNumber;
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

class InitPlayer {
  constructor(player, initBalance, enumPosition, isDealer, cards) {
    this.player = player;
    this.initBalance = initBalance;
    this.enumPosition = enumPosition;
    this.isDealer = isDealer;
    this.cards = cards;
  }
}

// this.initPlayers = [];      // all players who was active in start. Index === recPosition, some indexes == undefined!

// пока что без рейка
// создаем фейковый фрейм в котором балансы игроков === инит балансам в newPlayFrame
// в этом фрейме заканчивается вложение денег всех участников игры.. дочекивание всеми делаем потом
const createFinalFrame = (initPlayers, prevPlayFrame, newPlayFrame, isTerminal, finalBoard) => {
    // создаем массив плееров с инициальными балансами в новой руке из newPlayFrame
    // пока что без учета рейка
  const initBalances = newPlayFrame.playPlayers.map(player => player === undefined ? undefined : (player.curBalance + player.betAmount));

  // создаем фейковый фрейм на той же улице на которой есть последнее действие в prevPlayFrame если не терминальное состояние или на следующей улице
  // если совпали балансы prevPlayFrame и initBalances - игроки чекают все оставшиеся улицы
  if (isTerminal) {
    // шлем фрейм с ривером докуда все дочекали.. так же проверяем, что frameCreator каждый раз добавляет карты борда, даже если что-то не распознает!
    return Object.assign(prevPlayFrame, { board: finalBoard, isButtons: false });
  } else {
    // игроки могли сделать любое действие. А так же общее блайнды могли вырости(но это не важно)
    // Определяем вырос ли пот по балансу того кто выиграл и проиграл(ничья) и определяем были ли коллы или рейзы. Если игроков 2 и был рейз - определям был ли колл
    // если пот не вырос с момента последнего фрейма - все кто не успел вколить повышение - фолдят.. или все чекают до ривера включительно
    // если пот вырос - смотрим по потерям тех кто проиграл - кто колил а кто падал - завершаем улицу и чекаем до ривера(убираем ставки)

    // есть ли уникальный победитель - это единственный у кого прирос баланс

    const winnerChair = getUnicWinnerChair(initPlayers, newPlayFrame);

    if (winnerChair !== false && winnerChair !== null) {    // unic winner exist

    }

    const winnerLoosersPotDiff = newPlayFrame.playPlayers
  }
};

const getDistributionOfWinners = () => {    // returns { winner: chair, draw: }

};

const getDividedPots = (initPlayers) => {    // returns [ { chairs: [0, 1, 2, 3], pot: 10}, { chairs: [1, 2, 3], pot: 7}, { chairs: [2, 3], pot: 7} ]
  let balances = initPlayers.map((player) => {
    return player.initBalance;
  });

  const arr = [];

  while(balances.filter(cur => cur !== undefined).length > 1) {
    const min = Math.min(...balances.filter(cur => cur !== undefined));

    // we need 1) pot, 2) chairs who will divide pot

    const obj = { min, players: [] };
    obj.pot = 0;

    balances = balances.map((cur, i) => {
      if (cur !== undefined) {
        obj.pot += min;
        obj.players[i] = i;
      }

      if (cur > min) {
        return cur - min;
      }
    });

    arr.push(obj);
  }

  return arr;
};



// const getUnicWinnerChair = (initPlayers, newPlayFrame) => {     // false, null or unic winners recPosition
//   return initPlayers.reduce((isFound, cur, i) => {
//     if (isFound === false) {
//       return false;
//     } else if (cur !== undefined) {
//       if (newPlayFrame.playPlayers[i] === undefined) {
//         return isFound;
//       }
//
//       if (cur.initBalance < (newPlayFrame.playPlayers[i].curBalance + newPlayFrame.playPlayers[i].betAmount)) {
//         return isFound === null ? i : false;   // winners recPosition
//       }
//
//       return isFound;
//     }
//   }, null);
// };


module.exports.getValidHistory = getValidHistory;