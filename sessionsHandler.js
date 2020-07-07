const _ = require('lodash');

const prompterHandler = require('./playLogic/prompterHandler');
// const movesHandler = require('./movesHandler-pro');
const moves = require('./movesHandler');
// const oracle = require('./oracle');
const enumPoker = require('./enum');

/////////////////////////////////   TEST RAW ACTIONS
const rawActionList = [];

class ActionString {
    constructor(street, player, balance, action, pot, amount, position, gto, isHero) {
        this.street = street;
        this.player = player;
        this.balance = balance;
        this.action = action;
        this.pot = pot;
        this.amount = amount;
        this.position = position;
        this.gto = gto;
        this.isHero = isHero;
    }

    set setNickname(newNickname) {
        this.player = newNickname;
    }

};

// ha
rawActionList[0] = new ActionString(0, "So Lucky", 7.25, 0, 0, 0.1, 0, false, false); // post BB  -30
rawActionList[1] = new ActionString(0, "joooe84", 5, 0, 0.1, 0.25, 8, false, false);       // bet 0.75 BTN   -55
rawActionList[2] = new ActionString(0, "So Lucky", 7.15, 2, 0.35, 0.75, 0, false, false);   // call BB
rawActionList[3] = new ActionString(0, "joooe84", 4.75, 3, 1, 0.75, 8, false, false);       // bet 0.75 BTN


const testInitPlayers = [
    {
        player: 'So Lucky',
        initBalance: 7.25,
        enumPosition: 0,
        isDealer: true,
        cards: {
            hole1Value: '2',
            hole2Value: '7',
            hole1Suit: 's',
            hole2Suit: 'c'
        }
    },
    {
        player: 'random player',
        initBalance: 5,
        enumPosition: 8,
        isDealer: false,
        cards: null
    }
];

/////////////////////////////////  TEST Oracle
// const oraclePlaySetup = new oracle.oracle();
///////////////////////////////////
// setTimeout(async () => {
//     const result = await oraclePlaySetup.loggingHandHistory({
//         rawActions: rawActionList,
//         initPlayers: testInitPlayers,
//         room: 'Partypoker',
//         gameType: 'Spin&Go',
//         limit: 3,           // BB/100
//         board: {
//             C1: 'Ac',
//             C2: '7s',
//             C3: 'Kh'
//         },
//         plCount: 2,     // initPlayersLength
//         cash: {},
//         token: 'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj',     // So Lucky
//     });
// }, 3000);
/////////////////////////////////

class TasksQueue {
    constructor() {
        this.activeTasks = [];
        this.tasksQueue = [];
    }

    tasksHandler() {
        if (this.activeTasks.length < enumPoker.enumPoker.perfomancePolicy.maxActiveTasks) {
            const task = this.tasksQueue.shift();
            if (task) {
                this.activeTasks.push(task);

                const getResult = (strategy, handNumber, move_id, playSetup) => {   // sometimes we can get empty callback
                    if (strategy) {
                        playSetup.handPrompt(strategy, handNumber, move_id, playSetup.id);
                    }

                    this.activeTasks = this.activeTasks.filter(sim => sim.handNumber !== task.handNumber || sim.move_id !== task.move_id);
                    this.tasksHandler();
                };
                movesHandler.getHill(task.request, getResult);
            }
        }
    }

    queueHandler(handNumber, move_id, request) {
        this.tasksQueue.push({ handNumber, move_id, request });
        this.tasksHandler();
    }

    clearIrrelevantTasks(irrelevantHandNumber) {
        this.tasksQueue = this.tasksQueue.filter(task => task.handNumber !== irrelevantHandNumber);
    }
}

tasksQueue = new TasksQueue();

// all users sessions.. 1 token = 1 session
const sessions = {};

const sessionTimeout = 2000;
const setupTimeout = 1000;
const timeoutStep = 50000;

// one specific user with many SessionSetups
// setupID = one recognition table or simulator
class Session {
    constructor(setupID, token) {
        this.setups = {};
        this.timeout = sessionTimeout;
        this.setups[setupID] = new SessionSetup(setupID, token);

        this.intervalToDestroy = setInterval(() => {
            this.timeout--;
            if (this.timeout < 0) {
                // удаляем все интервалы у сетапов сессии
                Object.keys(this.setups).forEach(setupID => {
                    clearInterval(this.setups[setupID].intervalToDestroy);
                });
                console.log(`session ${token} over and will be remove`);
                clearInterval(this.intervalToDestroy);
                delete sessions[token];
            }
        }, timeoutStep);
    }
}

// one specific table/simulator inside Session
class SessionSetup {
    constructor(setupID, token) {
        this.setupID = setupID;
        this.token = token;
        this.addonSetup = null;  // setup
        this.playSetup = null;
        this.oracle = new oracle.oracle();
        this.timeout = setupTimeout;
        this.movesInEngine = 0;
        this.tasksQueue = tasksQueue;
        this.hillsCash = [];     // index === nIdMove.. board nIdMove === undefined. Value = { position, hill }
        this.initCash = Object.freeze({
            generation: '',
            players: [],
            preflop: [],
            flop: [],
            turn: [],
            river: [],
            c1: null,
            c2: null,
            c3: null,
            c4: null,
            c5: null,
        });
        this.movesCash = _.cloneDeep(this.initCash);

        this.intervalToDestroy = setInterval(() => {
            this.timeout--;
            if (this.timeout < 0) {
                clearInterval(this.intervalToDestroy);
                console.log(`setup ${this.setupID} over and will be remove`);
                if (this.oracle) {
                    this.oracle.doRelease();        // close oracle connection
                }
                delete sessions[token].setups[this.setupID];
            }
        }, timeoutStep);
    }

    resetCash() {
        this.movesCash = _.cloneDeep(this.initCash);
    }

    requestHandling(request) {
        // parse request
        const { requestType } = request.request;

        // simulator strategy
        if (requestType === 'strategy') {
            const { act_num, street } = request.request;
            const bbSize = Math.max(parseFloat(request.actions.preflop[0].amount), parseFloat(request.actions.preflop[1].amount));

            const result = moves.movesHandler(request, bbSize, this, act_num);

            if (result) {
                return result;
            } else {
                console.log(`movesHandler/// result is undefined`);
            }

        }
        // last move hero simulation for prompter
        if (requestType === 'prompter') {
            const gameTypesSettings = 'Spin&Go';   // config

            // должен записать в себя(this.playSetup = new PlaySetup, в котором записан текущий rawActionList, а так же нужно ли ресетить сетап
            prompterHandler.prompterListener(this, request, gameTypesSettings);
            // if (result && result.requestPrompter === 'prompt') {
            //     tasksQueue.queueHandler(result.handNumber, this, result);
            // }
        }
    }
}

// calls every time when request comes to the server
// setupID === table id
const sessionsListener = (token, setupID, request) => {
    if (token in sessions) {
        console.log('token in sessions!');
        sessions[token].timeout = sessionTimeout;                              // reset timer to destroy session
        if (setupID in sessions[token].setups) {
            console.log('setupID in sessions[token].setups');
            sessions[token].setups[setupID].timeout = setupTimeout;            // reset timer to destroy setup
            return sessions[token].setups[setupID].requestHandling(request);
        }

        sessions[token].setups[setupID] = new SessionSetup(setupID, token);
        console.log('sessions[token].setups[setupID].movesCash');
        console.log(sessions[token].setups[setupID].movesCash);

        return sessions[token].setups[setupID].requestHandling(request);
    }

    sessions[token] = new Session(setupID, token);

    return sessions[token].setups[setupID].requestHandling(request);
};

module.exports.sessionsListener = sessionsListener;








