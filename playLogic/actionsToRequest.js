const actionToRequest = (setup) => {
    const {
        rawActionList,
        board = [],
        initPlayers,
    } = setup;

    const result = {
        board: {
            c1: board[0] ? (board[0].value.toUpperCase() + board[0].suit) : null,
            c2: board[1] ? (board[1].value.toUpperCase() + board[1].suit) : null,
            c3: board[2] ? (board[2].value.toUpperCase() + board[2].suit) : null,
            c4: board[3] ? (board[3].value.toUpperCase() + board[3].suit) : null,
            c5: board[4] ? (board[4].value.toUpperCase() + board[4].suit) : null,
        },
        players: [],
        actions: createStreets(),
        nodeId: rawActionList.length,
    };

    function createStreets() {
        if (rawActionList[rawActionList.length - 1].street === 3) {
            return {
                preflop: [],
                flop: [],
                turn: [],
                river: []
            };
        } else if (rawActionList[rawActionList.length - 1].street === 2) {
            return {
                preflop: [],
                flop: [],
                turn: []
            };
        } else if (rawActionList[rawActionList.length - 1].street === 1) {
            return {
                preflop: [],
                flop: []
            };
        } else {
            return {
                preflop: []
            };
        }
    }

    playersForJson();
    function playersForJson() {
        initPlayers.forEach(player => {
            result.players.push({
                name: player.player,
                position: player.enumPosition,
                stack: player.initBalance,
                cards: player.cards,
            });
        });
    }

    ActionForJson();
    function ActionForJson() {
        for (let i = 0; i < rawActionList.length; i++) {
            if (rawActionList[i].street === 0) {
                result.actions.preflop.push({act_num: i + 1,
                    position: rawActionList[i].position,
                    balance: rawActionList[i].balance,
                    action: rawActionList[i].action,
                    amount: rawActionList[i].amount
                })
            }
            if (rawActionList[i].street === 1) {
                result.actions.flop.push({act_num: i + 1,
                    position: rawActionList[i].position,
                    balance: rawActionList[i].balance,
                    action: rawActionList[i].action,
                    amount: rawActionList[i].amount
                })
            }
            if (rawActionList[i].street === 2) {
                result.actions.turn.push({act_num: i + 1,
                    position: rawActionList[i].position,
                    balance: rawActionList[i].balance,
                    action: rawActionList[i].action,
                    amount: rawActionList[i].amount
                })
            }
            if (rawActionList[i].street === 3) {
                result.actions.river.push({act_num: i + 1,
                    position: rawActionList[i].position,
                    balance: rawActionList[i].balance,
                    action: rawActionList[i].action,
                    amount: rawActionList[i].amount
                })
            }
        }
    }
    // console.log('actionToRequest result');
    // console.log(result);

    return result;
};

module.exports.actionToRequest = actionToRequest;