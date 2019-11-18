var repl = require('repl');
var ffi = require('ffi');
var ref = require('ref');
var Struct = require('ref-struct');
var ArrayType = require('ref-array');
var int = ref.types.int;
var float = ref.types.float;
var double = ref.types.double;
var CString = ref.types.CString;

var IntArray = ArrayType(int);
var FloatArray = ArrayType(float);
var DoubleArray = ArrayType(double);


const PokerEngine = require('./pokerEngine');
const prompterHandler = require('./playLogic/prompterHandler');
const middleware = require('./engineMiddleware_work');
const moves = require('./movesHandler');

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
            }

            const result = middleware.getAllHandsStrategy(task.sessionSetup, task.request, [-1,0,1]);   // request need for client and stuff
            // handle result

            this.activeSimulations = this.activeSimulations.filter(simulation => simulation.engineID !== task.engineID);
            this.taskHandler();
        }
    };

    queueHandler(sessionSetup, request) {
        this.tasksQueue.push({ engineID: sessionSetup.engineID, sessionSetup, request });
        this.taskHandler();
    };
}

const simulationsQueue = new SimulationsQueue();

// all users sessions.. 1 token = 1 session
const sessions = {};

const sessionTimeout = 120;
const setupTimeout = 70;
const timeoutStep = 5000;

// one specific user with many SessionSetups
// setupID = one recognition table or simulator
class Session {
    constructor(setupID) {
        this.setups = {};
        this.timeout = sessionTimeout;
        this.setups[setupID] = new SessionSetup(-1);
        this.setups[setupID].timerToDestroy = setInterval(() => {
            this.setups[setupID].timeout--;
            if (this.setups[setupID].timeout < 0) {
                clearInterval(this.setups[setupID].timerToDestroy);
                PokerEngine.ReleaseSetup(this.setups[setupID].engineID);
                console.log(`setup ${setupID} over and will be remove`);
                delete this.setups[setupID];
            }
        }, timeoutStep);
    }
}

const initCash = Object.freeze({
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

// one specific table/simulator inside Session
class SessionSetup {
    constructor(engineID) {
        this.engineID = engineID; // PokerEngine session number
        this.timeout = setupTimeout;
        this.movesCash = initCash;
        this.movesInEngine = 0;
        this.playersHills = [];     // index === player position
        this.hillsCash = [];     // index === nIdMove.. board nIdMove === undefined. Value = { position, hill }
    }

    resetCash() {
        this.movesCash = initCash;
    }

    requestHandling(request) {
        // parse request
        const { requestType } = request.request;

        // simulator strategy
        if (requestType === 'strategy') {
            const { act_num, street } = request.request;
            const bbSize = parseInt(Math.max(parseFloat(request.actions.preflop[0].amount), parseFloat(request.actions.preflop[1].amount)) * 100);

            moves.movesHandler(request, bbSize, this, initCash);

            return middleware.getAllHandsStrategy(this, (act_num + street), request, [-1,0,1], true);
        }
        // last move hero simulation for prompter
        if (requestType === 'prompter') {
            const gameTypesSettings = 'Spin&Go';   // config

            // должен записать в себя(this.playSetup = new PlaySetup, в котором записан текущий rawActionList, а так же нужно ли ресетить сетап
            const requestPrompter = prompterHandler.prompterListener(this, request, gameTypesSettings);
            if (requestPrompter === 'prompt') {
                simulationsQueue.queueHandler(this, request);
            }
        }
    }

    releaseSetup() { return PokerEngine.ReleaseSetup(this.engineID) }
    setPlayer(stack, position, adaptation) { return PokerEngine.SetPlayer(this.engineID, stack, position, adaptation) }
}

// calls every time when request comes to the server
const sessionsListener = (token, setupID, request) => {
    const { requestType } = request.request;

    if (token in sessions) {
        sessions[token].timeout = sessionTimeout;                              // reset timer to destroy session
        if (setupID in sessions[token].setups) {
            sessions[token].setups[setupID].timeout = setupTimeout;            // reset timer to destroy setup
            return sessions[token].setups[setupID].requestHandling(request);
        }

        sessions[token].setups[setupID] = new SessionSetup(-1);
        return sessions[token].setups[setupID].requestHandling(request);
    }

    sessions[token] = new Session(setupID);

    sessions[token].timerToDestroy = setInterval(() => {
        sessions[token].timeout--;
        if (sessions[token].timeout < 0) {
            clearInterval(sessions[token].timerToDestroy);
            console.log(`session ${token} over and will be remove`);
            delete sessions[token];
        }
    }, timeoutStep);
    return sessions[token].setups[setupID].requestHandling(request);
};

module.exports.sessionsListener = sessionsListener;








