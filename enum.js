const enumPoker = Object.freeze({
    cardsName: ["2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As"],
    positions: ["BTN", "CO", "MP3", "MP2", "MP1", "UTG2", "UTG1", "UTG0", "BB", "SB"],
    adequatePositionsOrder9: ["SB", "BB", "UTG1", "UTG2", "MP1", "MP2", "MP3", "CO", "BTN"],
    adequatePositionsOrder6: ["SB", "BB", "MP2", "MP3", "CO", "BTN"],
    adequatePositionsOrder3: ["SB", "BB", "BTN"],
    adequateHaPreflopPositionsOrder: ["BTN", "SB"],
    actionsType: [null, "bet", "raise", "call", "check", "fold"],
    streets: ["preflop", "flop", "turn", "river"],
    allHandsCount: 1326,
});

module.exports = enumPoker;



