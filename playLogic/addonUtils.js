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
    return this.simSessionLight;
  }

  getSetup(bbSize) {
    console.log(`const setup = new addon.Setup(${bbSize});`);
    return new this.addon.Setup(bbSize);
  }

  getHandsDict() {
    return this.addon.GetHandsDict();
  }

  // выдает сайзинги следующего мува для сетапа
  getSizings(setup, simSession) {
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // simSession.add_or_replace_sizing(setup,400);
    //
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // var curSizings = simSession.get_sizings(setup);

    // Короче еще раз: последнний запушенный мув не имеет сайзингов.
    //   Если ты сверху еще запушишь в никуда - появится 1 чайлд и уже невозможно создать сайзинги.
    //   Сайщинги неявно создаются следубщими функциями: старт симулате, адд ор реплейс, гетсайзингс.
      // Если щапушишь в существубший сайзинг - заебись. Если в несуществующий - добавится еще один чайлд. Намотать такой узел можно - симулевать - ошибка

    const session = simSession || this.simSessionLight;

    console.log(`simSessionLight.get_sizings(setup);`);
    return session.get_sizings(setup);
  }

  // мув всегда существующий в рав актионс. Пушим только мувы фактические без бордов для получения сайзингов
  pushMove(setup, rawActions, move, isTerminal, board) {     // move_id - целевой несуществующий в rawActions мув
    // push moves and board
    if (rawActions[move]) {
      const { position, invest, action, street } = rawActions[move];

      // пушим блайнды в том числе
      console.log(`setup.push_move(${position}, ${invest * 100}, ${action});`);
      setup.push_move(position, invest * 100, action);

      if (isTerminal && board) {     // street move after push_move
        // console.log(`setup.push_move(${playUtils.getBoardDealPosition(street + 1), ...playUtils.getPushBoardCards((street + 1), board)})`);
        setup.push_move(playUtils.getBoardDealPosition(street + 1), ...playUtils.getPushBoardCards((street + 1), board));
      }
    }
  }

  popMove(setup) {
    console.log('setup.pop_move();');
    setup.pop_move();
  }

  popMoves(setup, street) {
    console.log(`setup.pop_moves(${street});`);
    setup.pop_moves(street);
  }

  replaceSizing(setup, sizing) {
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // simSession.add_or_replace_sizing(setup,400);
    //
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // var curSizings = simSession.get_sizings(setup);
  }

  addSizing(setup, sizing, simSession) {
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // simSession.add_or_replace_sizing(setup,400);
    //
    // Дмитрий Онуфриев, [03.03.21 09:57]
    // var curSizings = simSession.get_sizings(setup);

    // диапазоны
    // 0...2/5...3/5...9/10...11/10...allin

    const session = simSession || this.simSessionLight;

    console.log(`simSessionLight.add_or_replace_sizing(setup, ${sizing});`);
    session.add_or_replace_sizing(setup, sizing);
  }

  getStrategyAsync(isNodeSimulation, setup, simSessionLight, inputSpectres, numberOfSimulations, numThreads) {
    return new Promise(resolve => {
      if (isNodeSimulation) {
        console.log(`simSessionLight.start_simulate(setup, {}, 0, 0, strategy => {console.log('got strategy')})`);
        simSessionLight.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
      } else {
        console.log(`simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {console.log('got strategy')})`);
        // this.simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
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