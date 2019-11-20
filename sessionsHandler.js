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

const _ = require('lodash');


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

const sessionTimeout = 200;
const setupTimeout = 100;
const timeoutStep = 500;

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
                    if (this.setups[setupID].engineID !== -1) {
                        PokerEngine.ReleaseSetup(this.setups[setupID].engineID);
                    }
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
        this.engineID = -1; // PokerEngine session number
        this.timeout = setupTimeout;
        this.movesInEngine = 0;
        this.playersHills = [];     // index === player position
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
                if (this.engineID !== -1) {
                    PokerEngine.ReleaseSetup(this.engineID);
                }
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
            const bbSize = parseInt(Math.max(parseFloat(request.actions.preflop[0].amount), parseFloat(request.actions.preflop[1].amount)) * 100);

            moves.movesHandler(request, bbSize, this);

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








