const enumPoker = Object.freeze({
    cardsName: ["2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As"],
    positions: ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"],
    adequatePositionsOrder9: ["SB", "BB", "UTG1", "UTG2", "MP1", "MP2", "MP3", "CO", "BTN"],
    adequatePositionsOrder6: ["SB", "BB", "MP2", "MP3", "CO", "BTN"],
    adequatePositionsOrder3: ["SB", "BB", "BTN"],
    adequateHaPreflopPositionsOrder: ["BTN", "SB"],
    dealPositions: {
        DEALPOS_NONE: -1,
        DEALPOS_BTN: 0,
        DEALPOS_CO: 1,
        DEALPOS_MP3: 2,
        DEALPOS_MP2: 3,
        DEALPOS_MP1: 4,
        DEALPOS_UTG2: 5,
        DEALPOS_UTG: 6,
        DEALPOS_BB: 8,
        DEALPOS_SB: 9,
        DEALPOS_FLOP: 13,
        DEALPOS_TURN: 14,
        DEALPOS_RIVER: 15,
    },
    actionsType: ['post', "bet", "raise", "call", "check", "fold"],
    streets: ["preflop", "flop", "turn", "river"],
    allHandsCount: 1326,
    gameTypesSettings: {
        'Spin&Go': {
            heroChair: 2,
            playersCount: 3,
            hashSum: [7500, 5000, 3750, 2500, 1875, 1500, 1250],
        }
    },
    cardsValues: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'],
    cardsSuits: ['c', 's', 'd', 'h'],
    cardsSuitsName: ['clubs', 'spades', 'diamonds', 'hearts'],
    cardsSuitsCode: ['♣', '♠', '♦', '♥'],
    perfomancePolicy: {
        prepareCashStrategyStreet: 1,
        startSimulationStreet: 2,
        maxActiveTasks: 1,
        maxActiveSimulation: 1,
        oneHandCallRegretCount: 5,
    },
});

const enumCommon = Object.freeze({
    INVALID_FRAME: 'INVALID_FRAME',
    STOP_PROMPT: 'STOP_PROMPT',
    REJECT_HAND: 'REJECT_HAND',
    PROMPT: 'prompt',
    HAND_PROMPT: 'hand_prompt',
});

module.exports.enumPoker = enumPoker;
module.exports.enumCommon = enumCommon;



