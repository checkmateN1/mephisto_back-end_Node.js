const addonUtils = require('./addonUtils');
const enumPoker = require('../enum');


const hillUtils = Object.freeze({
  hillMultiply(cash, position, move_id) {
    return cash.reduceRight((hill, move, i) => {
      if (i > 1 && i < move_id && move.position === position) {
        const sizing = cash[i].sizing;
        const newHill = {};
        Object.keys(hill || cash[i].strategy).forEach(key => {        // keys - все руки
          newHill[key] = cash[i].strategy[key][sizing].strategy * (hill ? hill[key] : 1);
        });
        return newHill;
      }
      return hill;
    }, null);
  },

  getPlayersPositionsFromActions(rawActions) {
    const positions = {};

    rawActions.forEach(action => {
      if (!(action.position in positions)) {
        positions[action.position] = {};
      }
    });

    return positions;
  },

  getMockSpectres() {

  },

  getInputSpectres(rawActions, cash, move_id) {
    const positions = this.getPlayersPositionsFromActions(rawActions);
    const inputSpectres = {};
    Object.keys(positions).forEach(position => {
      inputSpectres[position] = this.hillMultiply(cash, parseInt(position), move_id);
    });
    return inputSpectres;
  },

  // вызываем только если deviationPercent !== 0 И количество Агро сайзингов больше 1
  getAverageHill(strategy, sizing = 130) {
    strategy = {
      '1324': {
        '0': { strategy: 0.013038018546011228, ev: 0 },
        '100': { strategy: 0.015115854946327008, ev: 0 },
        '2400': { strategy: 0.000004118389110483454, ev: 0 },
        '-1': { strategy: 0.9718420081185513, ev: 0 }
      },
      '1325': {
        '0': { strategy: 0.013038018546011228, ev: 0 },
        '100': { strategy: 0.015115854946327008, ev: 0 },
        '2400': { strategy: 0.000004118389110483454, ev: 0 },
        '-1': { strategy: 0.9718420081185513, ev: 0 }
      },
    };

    const oneHandStrategy = strategy[Object.keys(strategy)[0]];
    const allSizings = Object.keys(oneHandStrategy);
    const sizings = allSizings.map(sizing => parseInt(sizing))
      .filter(sizing => sizing !== -1);

    const first = this.getNearestSizing(sizings, sizing);
    const second = this.getNearestSizing(sizings.filter(sizing => sizing !== nearest1), sizing);

    if (first === 0 || second === 0) {    // не интерполируем между пассивным и агро мувом
      return strategy;
    }

    const lowerSizing = first > second ? second : first;
    const upperSizing = first > second ? first : second;

    const fLower = ((upperSizing - sizing)*(1 + lowerSizing))/((upperSizing - lowerSizing)*(1 + sizing));
    const fUpper = 1 - fLower;


    const result = {};
    for (const key in strategy) {
      result[key] = {};
      result[key][sizing] = {};
      result[key][sizing].strategy = strategy[key][lowerSizing].strategy * fLower + strategy[key][upperSizing].strategy * fUpper;
      result[key][sizing].ev = strategy[key][lowerSizing].ev * fLower + strategy[key][upperSizing].ev * fUpper;
    }
  },

  getNearestSizing(sizings, sizing) {     // возвращает ближайший АГРО!!-сайзинг к текущему
    let closedSizing = sizings[0];
    sizings.reduce((min, current) => {
      const diff = Math.abs(sizing - current);
      if (diff < min) {      // может быть и нулевой сайзинг
        closedSizing = current;
        return diff;
      } else {
        return min;
      }
    }, Infinity);

    return closedSizing;
  },
});

module.exports = hillUtils;
