const stats = require('./nodes_identifire');

// функция которая зная особенности узла: улица, повышеный ли, 3бет ли и тд перебирает только нужные функции для нод

const nodesStatsHandler = (setup, preCalculatedData) => {
  const penaltyArr = [];
  
  // напушиваем rawAсtions из setup. Определяем улицу следующего хода, терминальное ли состояние, была ли ставка, кто ходит следующим
  // если после мува запушен борд - значит это терминальное состояние и не нужно делать никаких проверок
  const rawActions = [];

  // !определяем целевую улицу и запускаем оппределение количества повышений на ней, номер стула и его инициативу, прфелоп тип пота
  // согласно своду правил улиц, префлоп типу пота и инициативе игрока на текущей улице проверяем совпадения
  // написать функцию, которая проверяет свод правил и соответствие их ситуации перед тем как запустить проверку (1)
  // все идентиикации нод хранятся в своде(2), сортированные поулично, и по типам пота префлоп - проверяют количество бетов и инициативу с предыдущей улицы


  // isTerminal - касается только rawActions без учета следующего узла, который и проверяем
  // const { rawActions, street, betCount, enumPosition, hasInitiative, preflopBetCount, isTerminal, cash } = options;
};


// 2  - возвращает массив функций, которые будут проверять ноды
function nodesIdentifireFunctionsSet(options) {
  return Object.keys(stats).map(fn => stats[fn](options)).filter(fn => fn !== undefined);
}

// function isTerminalStreetState(rawActionList) {
//   const currentAmount = this.maxAmountAtCurrentStreet();
//   const nPlayers = this.whoIsInGame();    //добавляем всех у кого УМНЫЙ баланc больше нуля и кто не делал фолд. массив с позициями
//
//   const currentStreet = rawActionList[rawActionList.length - 1].street;
//   if (rawActionList[rawActionList.length - 1].action < 3) {return false;}
//
//   // BB moves ones exception
//   if (currentStreet === 0 && rawActionList.filter(action => action.position === rawActionList[1].position).length === 1) {
//     return false;
//   }
//
//   for (let i = rawActionList.length - 1; i >= 0; i--) {
//     if (nPlayers.indexOf(rawActionList[i].position) >= 0) { // если среди играющих есть такой игрок
//       if (rawActionList[i].amount === currentAmount && rawActionList[i].street === currentStreet) { // проверяем совпадает ли значение его ставки и улица
//         nPlayers.splice(nPlayers.indexOf(rawActionList[i].position), 1); // удаляем игрока с совпавшей позицией
//         if (nPlayers.length === 0) {
//           return true;
//         }
//       } else {return false;}
//     }
//   }
// }

