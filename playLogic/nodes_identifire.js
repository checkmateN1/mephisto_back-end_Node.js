const stats = {
  // как часто игрок добровольно вкладывает деньги
  isVPIP_node(rawActions, enumPosition) {   // enumPosition === chair to move after all actions
    return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
  },

  // как часто игрок лимпит
  isLimp_node(rawActions, enumPosition, wasBet) {   // enumPosition === chair to move after all actions
    // не ставил бб И не делал ничего кроме поста сб
    if (wasBet) {
      return false;
    }
    return !rawActions.filter((action, i) => enumPosition === action.position && i !== 0).length;  // not SB post
  },


// процент рук, которые игрок открывает рейзом.
  isPFR_node(rawActions, enumPosition) {   // enumPosition === chair to move after all actions
    return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
  },

// процент рук, которые игрок открывает рейзом.
// use betsCount fn in prompterHandler to get betsCount
  is3Bet_node(rawActions, betsCount, isTerminal) {   // enumPosition === chair to move after all actions
    if (isTerminal || rawActions[rawActions.length - 1].street > 0 || betsCount !== 1) {
      return false;
    }
    return true;
  },

// Это ставка, сделанная вами на флопе, после того как вы выступали префлоп-агрессором.
// use hasInitiative fn in prompterHandler
// вызываем тогда когда ходит хиро => enum position === heroChair
  isCbetFlop_node(rawActions, hasInitiative, isTerminal) {   // enumPosition === chair to move after all actions
    if (rawActions[rawActions.length - 1].street === 0 && isTerminal) {
      return hasInitiative;
    }
    return false;
  },

  isCbetTurn_node(rawActions, hasInitiative, isTerminal) {   // enumPosition === chair to move after all actions
    if (rawActions[rawActions.length - 1].street === 1 && isTerminal) {
      return hasInitiative;
    }
    return false;
  },

  isDonkFlop_node(rawActions, hasInitiative, isTerminal) {   // enumPosition === chair to move after all actions
    if (rawActions[rawActions.length - 1].street === 0 && isTerminal) {
      return !hasInitiative;
    }
    return false;
  }
};

// Вычисляется по формуле AF = (Raise% + Bet%) / Call% и показывает, насколько часто игрок разыгрывает свои руки коллом или рейзом.
// const isAF_node = (rawActions, enumPosition) => {   // enumPosition === chair to move after all actions
//   // проверяем есть ли возможность сделать агро мув
//   // 1. остаток стека больше нуля
//   // 2. количество игроков в игре с остатком стека более нуля
//   return !rawActions.filter(action => action.action !== 0 && enumPosition === action.position).length;
// };

module.exports.stats = stats;
