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






// !!!!!!!!!!!!!!!!!!!! еще блайнды могли измениться!






// first initPlayers input
// const balances = [100, 50, 70, 10, undefined, 100, 100, 500, 400];
// let balances = [100, 50, 70, 10, 500];
const balances = [100, 50, 70];
let unicBalances = [...new Set(balances)].filter(el => el !== undefined).sort((a, b) => b - a); // [ 100, 70, 50 ]
const nets = Array(balances.length).fill(0);  // index === chair

// second initPlayers input
// let balancesNew = [70, 150, 0];  // 1 index win all, after 0 win 20 and 2 lost all he has
// let balancesNew = [50, 150, 20];  // 1 index win all, 0 and 2 draw
// let balancesNew = [220, 0, 0];  // 1 index win all, 0 and 2 draw
let balancesNew = [100, 50, 70];  // all got draw

// normalizing balances

// if one of new balances was't undefined and becomes => blanance === 0
console.log('unicBalances', unicBalances);
let downerCup = 0;  // уникальный баланс который уже поделили!

const getPlayerNet = (unicBalances, balances, isWin, isDraw, curUnicBalance, chair, nets, readOnly) => {
  const sum = unicBalances.reduce((sum, cur, index) => {
    // но не меньше уникального баланса который уже раздеребанен
    if (cur <= curUnicBalance && cur > downerCup && balances[chair] >= cur) {
      const min = cur - ((index === unicBalances.length - 1) ? 0 : unicBalances[index + 1]);
      const looseNet = (!isWin && !isDraw) ? min : 0;
      const winNet = isWin ? (balances.filter(bal => bal !== undefined && bal >= cur).length - 1) * min : 0;

      return sum + looseNet + winNet;
    }
    return sum;
  }, 0);

  if (readOnly) {
    return (isWin || isDraw) ? sum : -sum;
  } else {
    nets[chair] += (isWin || isDraw) ? sum : - sum;
    return nets[chair];
  }
};

let winIndex = unicBalances.length;   // индекс уникального стека у которого есть победитель - спец больше чем реальный индекс
let tmpIndex;
while (winIndex !== tmpIndex) {
  tmpIndex = winIndex;
  winIndex = unicBalances.reduce((newWinIndex, curUnicBalance, index) => {
    if (newWinIndex === winIndex && index < winIndex) {
      // перебираем балансы по убыванию пока не найдем винера
      if (balances.filter(el => el !== undefined && el >= curUnicBalance).length > 1) {  // there is 2 or more plrs who will claim the pot
        // !! if I found the winner - delete UNIC balances all top stacks witch less the winner's stack and calculating player's profit
        const winnerChair = balances.reduce((winner, curPlayerBlance, i) => {   // getting winner chair
          if (winner === null && curPlayerBlance !== undefined && curPlayerBlance >= curUnicBalance && newWinIndex === winIndex) {    // plr claim the pot - checking is he winner
            const bal = getPlayerNet(unicBalances, balances, true, false, curUnicBalance, i, nets, true);
            if (bal + (curPlayerBlance + nets[i]) === (balancesNew[i] === undefined ? 0 : balancesNew[i])) {   // winner
              newWinIndex = index;
              return i;
            }
          }
          return winner;
        }, null);

        if (winnerChair !== null) {
          balances.forEach((blance, i) => {
            if (blance !== undefined) {
              const isWin = winnerChair === i;
              const bal = getPlayerNet(unicBalances, balances, isWin, false, curUnicBalance, i, nets, false);
            }
          });
          downerCup = curUnicBalance;
        } else if (index === unicBalances.length - 1) {
          newWinIndex = unicBalances.length;    // БОЛЬШЕ чем существующие индексы в уникальных балансах на 1 - не использовать его
        }
      }
    }

    return newWinIndex;
  }, winIndex);
}

// draws
// if (winIndex) {
//   unicBalances.forEach((cur) => {
//     if (balances.filter(el => el !== undefined && el >= cur).length > 1) {  // there is 2 or more plrs who will claim the pot
//       balances.forEach((blance, i) => {
//         if (blance !== undefined && blance >= cur) {
//           // if player still has money
//           if (balances[i] > nets[i]) {
//             const bal = getPlayerNet(unicBalances, balances, false, true, cur, i, nets, false);
//           }
//         }
//       });
//     }
//   });
// }

console.log(balances);
console.log(nets);


module.exports.getValidHistory = getValidHistory;