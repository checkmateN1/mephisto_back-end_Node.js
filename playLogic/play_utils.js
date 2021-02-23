// export enum = require('../enum');

// const oldStacks = [
//   '3:3:3',    '6:6:3',    '9:9:3',    '12:12:3',
//   '15:15:3',  '18:18:3',  '21:21:3',  '24:24:3',
//   '27:27:3',  '30:30:3',  '33:33:3',  '36:36:3',
//   '6:6:6',    '9:9:6',    '12:12:6',  '15:15:6',
//   '18:18:6',  '21:21:6',  '24:24:6',  '27:27:6',
//   '30:30:6',  '33:33:6',  '9:9:9',    '12:12:9',
//   '15:15:9',  '18:18:9',  '21:21:9',  '24:24:9',
//   '27:27:9',  '30:30:9',  '33:33:9',  '12:12:12',
//   '15:15:12', '18:18:12', '21:21:12', '24:24:12',
//   '27:27:12', '30:30:12', '15:15:15', '18:18:15',
//   '21:21:15', '24:24:15', '27:27:15', '30:30:15',
//   '18:18:18', '21:21:18', '24:24:18', '27:27:18',
//   '21:21:21', '24:24:21', '27:27:21', '24:24:24'
// ];

const playUtils = Object.freeze({
  getNearestStackComb(stacksArr) {

  },

  createStacksArr(maxSum, step) {
    const arr = [];
    // const arr1 = [];
    // const arr2 = [];
    [...Array(maxSum)].forEach((cur, i) => {
      const min = i + 1;
      [...Array(maxSum)].forEach((cur, middle) => {
        const max = maxSum - middle - min;
        if (middle >= min && max >= middle && (min + middle + max) === maxSum && (min%step === 0) && (middle%step === 0)) {
          arr.push(`${middle}:${middle}:${min}`);
          arr.push(`${middle}:${min}:${middle}`);
          arr.push(`${min}:${middle}:${middle}`);
        }
      });
    });

    return [...new Set(arr)];
  },

  // !!! rawActions functions

  // инициальный баланс на текущей улице(или указанной). Так же используется для валидации и замены глючных амаунтов или балансов
  // выдает то, что мы запишем в баланс первого мува на текущей улице в rawActions
  // передаем обрезаный до целевого мува rawActions
  initPlayerBalance(enumPosition, initPlayers, rawActions, positionEnumKeyMap) {
    const currentStreet = rawActions[rawActions.length - 1].street;
    let initBalance;

    for (let i = rawActions.length - 1; i >= 0; i--) {
      if (rawActions[i].position === enumPosition) {
        if (currentStreet === rawActions[i].street) {
          initBalance = rawActions[i].balance;
        } else if (initBalance !== undefined) {
          return initBalance;
        } else {
          return rawActions[i].balance - rawActions[i].invest;
        }
      }
    }

    if (initBalance !== undefined) {
      return initBalance;
    }

    return initPlayers[positionEnumKeyMap[enumPosition]].initBalance;   // was't any move before
  },

  // передаем обрезаный до целевого мува rawActions
  whoIsInGame(rawActions, initPlayers, positionEnumKeyMap) {
    const playersInGame = [];       //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд
    const blackList = [];
    const allPlayers = [];
    for (let i = rawActions.length - 1; i >= 0; i--) { //добавляем всех кто сфолдил или баланс = 0
      if (Math.abs(this.initPlayerBalance(rawActions[i].position, initPlayers, rawActions, positionEnumKeyMap) - rawActions[i].amount) < 0.1 || rawActions[i].action === 5) {
        blackList.push(rawActions[i].position);
      }
    }

    initPlayers.forEach(player => {
      if (player !== undefined) {
        allPlayers.push(player.enumPosition);
      }
    });

    for (let i = allPlayers.length - 1; i >= 0; i--) { // добавляем только тех кто остался
      if (blackList.indexOf(allPlayers[i]) < 0) {
        playersInGame.push(allPlayers[i]);
      }
    }
    return playersInGame;
  },

  // передаем обрезаный до целевого мува rawActions
  maxAmountAtCurrentStreet(rawActions) {
    const currentStreet = rawActions[rawActions.length - 1].street;
    for (let i = rawActions.length - 1; i > 0; i--) {
      if (rawActions[i].street === currentStreet) {
        if (rawActions[i].action < 3) {
          return +rawActions[i].amount;
        }
      } else {
        return 0;
      }
    }
    return +rawActions[1].amount;       // BB
  },

  isTerminalStreetState(rawActions, move, initPlayers, positionEnumKeyMap) {
    const currentAmount = this.maxAmountAtCurrentStreet(rawActions);
    const nPlayers = this.whoIsInGame(rawActions, initPlayers, positionEnumKeyMap);    //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд. массив с позициями

    const currentStreet = rawActions[rawActions.length - 1].street;
    if (rawActions[rawActions.length - 1].action < 3) {return false;}

    // BB moves ones exception
    if (currentStreet === 0 && rawActions.filter(action => action.position === rawActions[1].position).length === 1) {
      return false;
    }

    for (let i = rawActions.length - 1; i >= 0; i--) {
      if (nPlayers.indexOf(rawActions[i].position) >= 0) { // если среди играющих есть такой игрок
        if (rawActions[i].amount === currentAmount && rawActions[i].street === currentStreet) { // проверяем совпадает ли значение его ставки и улица
          nPlayers.splice(nPlayers.indexOf(rawActions[i].position), 1); // удаляем игрока с совпавшей позицией
          if (nPlayers.length === 0) {
            return true;
          }
        } else {return false;}
      }
    }
  },

  // определяем делаем ли мы именно симуляции а не агреггируем сетями
  nodeSimulation(playSetup, rawActionList, move, initPlayers, positionEnumKeyMap, isDebugMode) {
    // !!!!!!!!!!!!!!!!!!! определять для конкретного мува терминальное здесь или не здесь!
    const initStreet = rawActionList[move] ? rawActionList[move].street : rawActionList[rawActionList.length - 1].street;

    // debug
    if (isDebugMode && playSetup.client) {
      const rawActionsSlice = rawActionList.slice();
      if (move !== undefined && rawActionsSlice[move]) {
        rawActionsSlice.length = move + 1;
      }

      const isTerminal = this.isTerminalStreetState(rawActionsSlice, move, initPlayers, positionEnumKeyMap);
      const street = this.getNextMoveSeet(rawActionsSlice, isTerminal);     // улица следующего за rawActionList хода
      const result = this.getMovesCount(rawActionsSlice, street, isTerminal) >= enumPoker.enumPoker.perfomancePolicy.startMoveSimulation;

      const data = {
        street,
        isTerminal,
        isNeedCash: true,
        isNodeSimulation: street < enumPoker.enumPoker.perfomancePolicy.startSimulationStreet ? false : result,
        movesCount: this.getMovesCount(rawActionsSlice, street, isTerminal),
      };

      console.log('debug_moves_handler', data);
      playSetup.client.emit(enumPoker.enumCommon.DEBUG_MOVES_HANDLER, data);
    }

    if (initStreet > enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
      return true;
    }

    const rawActionsSlice = rawActionList.slice();
    if (move !== undefined && rawActionsSlice[move]) {
      rawActionsSlice.length = move + 1;
    }

    const isTerminal = this.isTerminalStreetState(rawActionsSlice, move, initPlayers, positionEnumKeyMap);
    const street = this.getNextMoveSeet(rawActionsSlice, isTerminal);     // улица следующего за rawActionList хода

    if (street < enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
      return false;
    }

    return this.getMovesCount(rawActionsSlice, street, isTerminal) >= enumPoker.enumPoker.perfomancePolicy.startMoveSimulation;
  },

  // возвращает улицу текущего мува
  getCurStreet(rawActionList, move, initPlayers, positionEnumKeyMap) {
    if (rawActionList[move]) {
      return rawActionList[move].street;
    }

    const isTerminal = this.isTerminalStreetState(rawActionList, move, initPlayers, positionEnumKeyMap);
    return this.getNextMoveSeet(rawActionList, isTerminal);
  },

  // возвращает улицу СЛЕДУЮЩЕГО за предысторией мува
  getNextMoveSeet(rawActionList, isTerminal) {
    let lastStreet = rawActionList[rawActionList.length - 1].street;

    return (isTerminal && lastStreet < 3) ? (lastStreet + 1) : lastStreet;
  },

  // возвращает количество фактических ходов на улице
  getMovesCount(rawActionList, street, isTerminal) {
    if (isTerminal) {
      return 0;
    }

    return rawActionList.filter(el => el.street === street).length;
  }
});

// console.log(playUtils.createStacksArr(75, 3));

module.exports = playUtils;
