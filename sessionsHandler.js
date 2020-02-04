const _ = require('lodash');

const prompterHandler = require('./playLogic/prompterHandler');
const movesHandler = require('./movesHandler-pro');

class SimulationsQueue {
    constructor() {
        this.maxActiveTasks = 2;
        this.activeSimulations = [];
        this.tasksQueue = [];
    }

    taskHandler() {
        if (this.activeSimulations.length < this.maxActiveTasks) {
            const task = this.tasksQueue.shift();
            if (task) {
                this.activeSimulations.push(task);

                const getResult = (strategy, handNumber, move_id, playSetup) => {
                    // prompterHandler convert one hand strategy to prompt for client
                    playSetup.handPrompt(strategy, handNumber, move_id, playSetup.id);

                    this.activeSimulations = this.activeSimulations.filter(simulation => simulation.handNumber !== task.handNumber);
                    this.taskHandler();
                };
                movesHandler.getHill(task.request, getResult);
            }
        }
    };

    queueHandler(handNumber, request) {
        this.tasksQueue.push({ handNumber, request });
        this.taskHandler();
    };

    clearIrrelevantTasks(oldHandNumber) {
        this.tasksQueue = this.tasksQueue.filter(task => task.handNumber !== oldHandNumber);
    }
}

const simulationsQueue = new SimulationsQueue();

// all users sessions.. 1 token = 1 session
const sessions = {};

const sessionTimeout = 200;
const setupTimeout = 100;
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
        this.playSetup = {};
        this.timeout = setupTimeout;
        this.movesInEngine = 0;
        this.simulationsQueue = simulationsQueue;
        this.hillsCash = [];     // index === nIdMove.. board nIdMove === undefined. Value = { position, hill }
        this.initCash = Object.freeze({
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
            const result = prompterHandler.prompterListener(this, request, gameTypesSettings);
            if (result && result.requestPrompter === 'prompt') {
                simulationsQueue.queueHandler(result.handNumber, this, result);
            }
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








