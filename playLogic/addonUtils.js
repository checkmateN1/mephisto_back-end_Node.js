const enumPoker = require(`../enum`);
const playUtils = require('./play_utils');

const trainedPrefixLight = 'trained_SS_light';
const trainedPrefixHeavy = 'trained_SS_heavy';

class AddonUtils {
  constructor(diskDrive, prefixLight, prefixHeavy, useCpu) {
    this.addon = require(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon`);
    if (useCpu) {
      this.addon.SetDefaultDevice('cpu');
    }

    this.addon.DeserializeBucketingType(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 0);
    this.addon.DeserializeBucketingType(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 4);

    this.busLight = new this.addon.RegretModelThread(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\${prefixLight}`); // global
    this.busHeavy = new this.addon.RegretModelThread(`${diskDrive}:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\${prefixHeavy}`); // global

    this.simSessionHeavy = new this.addon.PluribusSimSession(this.busHeavy)  // heavy without hero hand and hero position
    this.simSessionLight = new this.addon.PluribusSimSession(this.busLight)  // heavy without hero hand and hero position
  }

  getSimSessionForFeatureWithHeroHand(heroPosition, heroHand) {   /* hero_pos = 8, hero_hand = 0 */
    return new this.addon.PluribusSimSession(this.busLight, heroPosition, heroHand);
  }

  getSimSessionForFeatureWithoutHeroHand() {
    return new this.addon.PluribusSimSession(this.busLight);
  }

  getSetup(bbSize) {
    return new this.addon.Setup(bbSize);
  }

  getHandsDict() {
    return this.addon.GetHandsDict();
  }

  // мув всегда существующий в рав актионс.
  getSizings(setup) {
    // !!! WAITING API

    const strategy = {
      '167': {
        '0': { strategy: 0.0011505433459377008, ev: 20 },
        '100': { strategy: 0.0478785282734064, ev: 10 },
        '133': { strategy: 0, ev: 40 },
        '200': { strategy: 0.000045384682651174424, ev: 35 },
        '300': { strategy: 0, ev: 14 },
        '2400': { strategy: 0, ev: -40 },
        '-1': { strategy: 0.9509255436980047, ev: 10 }
      },
    };

    return strategy;
  }

  // мув всегда существующий в рав актионс. Пушим только мувы фактические без бордов для получения сайзингов
  pushMove(setup, rawActions, move, isTerminal, board) {     // move_id - целевой несуществующий в rawActions мув
    // push moves and board
    if (rawActions[move]) {
      const { position, invest, action, street } = rawActions[move];

      // пушим блайнды в том числе
      setup.push_move(position, invest, action);

      if (isTerminal && board) {     // street move after push_move
        console.log(`push board`);
        setup.push_move(playUtils.getBoardDealPosition(street + 1), ...playUtils.getPushBoardCards((street + 1), board));
      }
    }
  }

  getStrategyAsync(isNodeSimulation, setup, simSessionLight, inputSpectres, numberOfSimulations, numThreads) {
    return new Promise(resolve => {
      if (isNodeSimulation) {
        simSessionLight.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
      } else {
        this.simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
      }
    });
  }
}

// Дмитрий Онуфриев, [26.02.21 23:57]
// Гет, реплейс, адд
//
// Дмитрий Онуфриев, [26.02.21 23:57]
// И все это только доя текущего узла
//
// Дмитрий Онуфриев, [26.02.21 23:57]
// А в узел приходишь пушем или попом

// const addonUtils = new AddonUtils(enumPoker.enumPoker.perfomancePolicy.projectDrive, trainedPrefixLight, trainedPrefixHeavy, enumPoker.enumPoker.perfomancePolicy.useCpu);
// const simSessionLight = addonUtils.getSimSessionForFeatureWithoutHeroHand();
// const setup = addonUtils.getSetup(1.0);
// setup.set_player(0,2500)
// setup.set_player(8,5000)
// setup.push_move(0, 50, 0)
// setup.push_move(8, 100, 0)
// setup.push_move(0, 150, 2)
// setup.push_move(8, 100, 3)
// setup.push_move(13, 32, 43, 38)
// setup.push_move(8, 0, 4)
// setup.push_move(0, 0, 4)
// setup.push_move(14, 51)
// setup.push_move(8, 0, 4)
// setup.push_move(0, 300, 1)
//
// addonUtils.getStrategyAsync(true, setup, simSessionLight).then(data => {console.log(data)});

module.exports = new AddonUtils(enumPoker.enumPoker.perfomancePolicy.projectDrive, trainedPrefixLight, trainedPrefixHeavy, enumPoker.enumPoker.perfomancePolicy.useCpu);