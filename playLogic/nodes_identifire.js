const stats = {
  // street, betCount, enumPosition, hasInitiative, preflopBetCount

  // как часто игрок добровольно вкладывает деньги
  isVPIP_node(options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.betCount === 0 && !options.isTerminal) {
      const { rawActions, enumPosition } = options;

      return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
    }
  },

  // как часто игрок лимпит
  isLimp_node(options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.betCount === 0 && !options.isTerminal) {
      const { rawActions, enumPosition } = options;
      // не ставил бб И не делал ничего кроме поста сб
      return !rawActions.filter((action, i) => enumPosition === action.position && i !== 0).length;  // not SB post
    }
  },

  // процент рук, которые игрок открывает рейзом.
  isPFR_node(rawActions, enumPosition, options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.betCount === 0 && !options.isTerminal) {
      const { rawActions, enumPosition } = options;

      return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
    }
  },

  // процент рук, которые игрок открывает рейзом.
  // use betsCount fn in prompterHandler to get betsCount
  is3Bet_node(rawActions, betsCount, isTerminal, options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.betCount === 1 && !options.isTerminal) {
      return true;
    }
  },

  // Это ставка, сделанная вами на флопе, после того как вы выступали префлоп-агрессором.
  // use hasInitiative fn in prompterHandler
  // вызываем тогда когда ходит хиро => enum position === heroChair
  isCbetFlop_node(rawActions, hasInitiative, isTerminal, options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.isTerminal) {
      return options.hasInitiative;
    }
    return false;
  },

  isDonkFlop_node(rawActions, hasInitiative, isTerminal, options) {   // enumPosition === chair to move after all actions
    if (options.street === 0 && options.isTerminal) {
      return !options.hasInitiative;
    }
    return false;
  },

  isCbetTurn_node(rawActions, hasInitiative, isTerminal, options) {   // enumPosition === chair to move after all actions
    if (options.street === 1 && options.isTerminal) {
      return options.hasInitiative;
    }
    return false;
  },
};

// Вычисляется по формуле AF = (Raise% + Bet%) / Call% и показывает, насколько часто игрок разыгрывает свои руки коллом или рейзом.
// const isAF_node = (rawActions, enumPosition) => {   // enumPosition === chair to move after all actions
//   // проверяем есть ли возможность сделать агро мув
//   // 1. остаток стека больше нуля
//   // 2. количество игроков в игре с остатком стека более нуля
//   return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
// };

module.exports = stats;
