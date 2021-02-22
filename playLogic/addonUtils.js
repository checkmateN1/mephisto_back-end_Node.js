const enumPoker = require(`../enum`);

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

  getStrategyAsync(isNodeSimulation, setup, simSessionLight, inputSpectres, numberOfSimulations, numThreads) {
    return new Promise(resolve => {
      if (isNodeSimulation) {
        // const addon = require(`C:\\projects\\mephisto_back-end_Node.js\\custom_module\\PokerEngine\\pokerengine_addon`);
        // addon.DeserializeBucketingType(`C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 0);
        // addon.DeserializeBucketingType(`C:\\projects\\mephisto_back-end_Node.js\\custom_module\\buckets\\`, 4);
        // const bus = new addon.RegretModelThread('C:\\projects\\mephisto_back-end_Node.js\\custom_module\\models\\trained_SS_light'); // global
        // const simSessionLight = new addon.PluribusSimSession(bus);
        //
        // const setup = new addon.Setup(1.0)
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
        // simSessionLight.start_simulate(setup, {}, 0, 0, strategy => {console.log(strategy)});


        // this.simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});    // WORK
        this.simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
      } else {
        this.simSessionHeavy.start_simulate(setup, {}, 0, 0, strategy => {resolve(strategy)});
      }
    });
  }
}

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