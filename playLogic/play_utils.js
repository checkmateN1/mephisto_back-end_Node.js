// export enum = require('../enum');
const addonUtils = require('./addonUtils');
const enumPoker = require('../enum');

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

  getMaxAmountBeforeMove(rawActionList, move, street) {
    const currentStreet = street !== undefined ? street : rawActionList[move].street;
    for (let i = move - 1; i >= 0; i--) {
      if (rawActionList[i].street === currentStreet) {
        if (rawActionList[i].action < 3) {
          return rawActionList[i].amount;
        }
      } else {
        return 0;
      }
    }
    return 0;
  },

  getPrevAmountOnCurStreet(rawActionList, move) {
    const currentStreet = rawActionList[move].street;
    const position = rawActionList[move].position;
    for (let i = move - 1; i >= 0; i--) {
      if (currentStreet === rawActionList[i].street) {
        if (position === rawActionList[i].position) {
          return rawActionList[i].amount;
        }
      } else {
        return 0;
      }
    }
    return 0;
  },

  // определяем есть ли хотя бы 1 нестандартный сайзинг(для симулятора)
  isNonStandartSizings(rawActions, street, maxDeviationsPercent, setup, simSession) {    // maxDeviationPercent = % отклонения от ближайшего сайзинга
    // sizings = [[], [], [], ...] - запрос к аддону по конкретной улице // набор всех сайзингов на улице: 0 - bet, 1 - raise, 2 - reraise
    // maxDeviationsPercent = [0.15, 0.2, 0.25] - preflop /// !возможны разные девиации в зависимости от дальности сайзингов от корня улицы или нехватки таймбанка
    // !! Всегда подаем setup из начала улицы после пуша борда!!!

    // нужны все, чтоб пушить мувы в setup
    const actions = rawActions.filter(action => action.street === street);

    // начинаем идти циклом и пушить фактические мувы если они не агрессивные. Если агрессивные - опрашиваем сайзинги
    // затем пушим мув с фактическим сайзингом и идем до конца всех актионс на улице.
    // заполняем массив с объектами для каждого индекса актионс - фактический сайзинг, позиция, сайзинги(sizings)
    const isAdd = enumPoker.enumPoker.perfomancePolicy.isAddSizing;

    const sizingsResult = this.getSizingsComparingAtCurStreet(actions, setup, isAdd, simSession, street, maxDeviationsPercent).filter(el => el !== undefined);
    // [{sizings, actualSizing}, {sizings, actualSizing}, etc]    without undefined

    return !!sizingsResult.filter(el => !!el.isNotStandart).length;
  },

  // returns [{sizings, actualSizing}, undefined, {sizings, actualSizing}, etc]    index === action index at street
  getSizingsComparingAtCurStreet(actions, setup, isAdd, simSession, street, maxDeviationsPercent) {
    // откатили назад
    addonUtils.popMoves(setup, street);   // откатывает в корень указанной улицы


    let agroMovesCount = 0;
    const sizingsResult = actions.map((action, i) => {
      const result = {};
      // берем сайзинги из аддона
      result.sizings = addonUtils.getSizings(setup, simSession);  // array with numbers

      if (action.action === 1 || action.action === 2) {  // агромув
        result.actualSizing = i > 0 ? (action.amount * 100 - this.getMaxAmountBeforeMove(actions, i, action.street) * 100) : action.invest * 100;
        result.deviationPercent = this.getDeviationPercent(result.sizings, result.actualSizing);
        result.isNotStandart = this.isNonStandartSizing(result.deviationPercent, maxDeviationsPercent[Math.min(agroMovesCount, maxDeviationsPercent.length - 1)]);
        agroMovesCount++;

        // пушим сайзинги или реплейсим
        if (!!result.deviationPercent && isAdd) {
          addonUtils.addSizing(setup, result.actualSizing, simSession);
        }
      }

      // const testSizings = addonUtils.getSizings(setup, simSession);
      addonUtils.pushMove(setup, actions, i, false);

      if (result.actualSizing) {
        return result;
      }
    });

    // откатили назад
    addonUtils.popMoves(setup, street);   // откатывает в корень указанной улицы

    return sizingsResult;
  },

  isNonStandartSizing(deviationPercent, maxDeviationPercent) {
    return deviationPercent > maxDeviationPercent;
  },

  getDeviationPercent(sizings, sizing) {
    const closest = this.getClosestSizing(sizings, sizing);
    return (Math.abs(sizing - closest))/closest;
  },

  // определяем нестандартный сайзинг
  getClosestSizing(sizigs, sizing) {     // возвращает ближайший AGRO сайзинг к текущему
    let closedSizing;
    sizigs.reduce((min, current) => {
      if (current > 0) {
        const diff = Math.abs(sizing - current);
        if (diff < min) {
          closedSizing = current;
          return diff;
        }
      }
      return min;
    }, Infinity);

    return closedSizing;
  },

  getBoardDealPosition(street) {
    switch (street) {
      case 1:
        return enumPoker.enumPoker.dealPositions.DEALPOS_FLOP;
      case 2:
        return enumPoker.enumPoker.dealPositions.DEALPOS_TURN;
      case 3:
        return enumPoker.enumPoker.dealPositions.DEALPOS_RIVER;
    }
  },

  getPushBoardCards(street, board) {
    switch (street) {
      case 1:
        return [enumPoker.enumPoker.cardsName.indexOf(board[0].value.toUpperCase() + board[0].suit),
          enumPoker.enumPoker.cardsName.indexOf(board[1].value.toUpperCase() + board[1].suit),
          enumPoker.enumPoker.cardsName.indexOf(board[2].value.toUpperCase() + board[2].suit)];
      case 2:
        return [enumPoker.enumPoker.cardsName.indexOf(board[3].value.toUpperCase() + board[3].suit)];
      case 3:
        return [enumPoker.enumPoker.cardsName.indexOf(board[4].value.toUpperCase() + board[4].suit)];
    }
  },

  // определяем делаем ли мы именно симуляции а не агреггируем сетями
  nodeSimulation(playSetup, rawActionList, move, initPlayers, positionEnumKeyMap, isDebugMode, curStreetMove) {
    // !!!!!!!!!!!!!!!!!!! определять для конкретного мува терминальное здесь или не здесь!

    // debug
    if (isDebugMode && playSetup.client) {
      const rawActionsSlice = rawActionList.slice();
      if (move !== undefined && rawActionsSlice[move]) {
        rawActionsSlice.length = move + 1;
      }

      const isTerminal = this.isTerminalStreetState(rawActionsSlice, move, initPlayers, positionEnumKeyMap);
      const result = this.getMovesCount(rawActionsSlice, curStreetMove) >= enumPoker.enumPoker.perfomancePolicy.startMoveSimulation;

      const data = {
        street: curStreetMove,
        isTerminal,
        isNeedCash: true,
        isNodeSimulation: street < enumPoker.enumPoker.perfomancePolicy.startSimulationStreet ? false : result,
        movesCount: this.getMovesCount(rawActionsSlice, curStreetMove),
      };

      console.log('debug_moves_handler', data);
      playSetup.client.emit(enumPoker.enumCommon.DEBUG_MOVES_HANDLER, data);
    }

    if (curStreetMove < enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
      return false;
    }

    if (curStreetMove > enumPoker.enumPoker.perfomancePolicy.startSimulationStreet) {
      return true;
    }

    return this.getMovesCount(rawActionList, curStreetMove) >= enumPoker.enumPoker.perfomancePolicy.startMoveSimulation;
  },

  // возвращает улицу текущего мува
  getCurStreet(rawActionList, move, initPlayers, positionEnumKeyMap, isTerminal) {
    if (rawActionList[move]) {
      return rawActionList[move].street;
    }

    // нету такого мува - берем следующий за rawActions
    return this.getNextMoveStreet(rawActionList, isTerminal);
  },

  // возвращает улицу СЛЕДУЮЩЕГО за предысторией ВСЕГО rawActions мува
  getNextMoveStreet(rawActionList, isTerminal) {
    const lastStreet = rawActionList[rawActionList.length - 1].street;

    return (isTerminal && lastStreet < 3) ? (lastStreet + 1) : lastStreet;
  },

  // возвращает количество фактических ходов на улице
  getMovesCount(rawActionList, street) {
    return rawActionList.filter(el => el.street === street).length;
  },

  getSetupWithMoves(rawActions, move, isTerminal, bbSize, initPlayers, board) {
    const setup = addonUtils.getSetup(bbSize/100);

    initPlayers.forEach(player => {
      addonUtils.setPlayer(setup, player.enumPosition, player.initBalance);
    });

    let isTerminalCalc = false;

    if (move > 2) {
      if ((rawActions[move + 1] && rawActions[move + 1].street !== rawActions[move].street)) {
        isTerminalCalc = true;
      } else if (!rawActions[move + 1]) {
        isTerminalCalc = isTerminal;
      }
    }

    for (let i = 0; i <= move; i++) {
      addonUtils.pushMove(setup, rawActions, i, isTerminalCalc, board);
    }

  },
});

// console.log(playUtils.createStacksArr(75, 3));

module.exports = playUtils;
