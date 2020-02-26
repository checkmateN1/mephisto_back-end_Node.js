const _ = require('lodash');
const oracledb = require('oracledb');

const prompterHandler = require('./playLogic/prompterHandler');
const movesHandler = require('./movesHandler-pro');
const moves = require('./movesHandler');
const enumPoker = require('./enum');

class Oracle {
    constructor() {
        this.connection = null;
        this.connect();
    }

    async connect() {
        await oracledb.getConnection({
                user          : "VERTER",
                password      : "1ZHo2lZfT10Q5",
                connectString : "192.168.1.30:1521/VERTER"
            },
            async (err, connection) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                if (connection) {
                    this.connection = connection;
                }

            }
        );
    }

    async testSelect() {
        if (this.connection) {
            const sql = `SELECT * FROM EE_BRAK`;
            const binds = {};

            // For a complete list of options see the documentation.
            const options = {
                outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
                // extendedMetaData: true,   // get extra metadata
                // fetchArraySize: 100       // internal buffer allocation size for tuning
            };

            const result = await this.connection.execute(sql, binds, options);

            console.log("Column metadata: ", result.metaData);
            console.log("Query results: ");
            console.log(result.rows);
        }
    }

    async addHand(roomID, limit, board, plCount) {
        if (this.connection) {
            try {
                // const sql = `INSERT INTO TT_HANDS (ID, ID_ROOM, HANDNUM) VALUES (handnumberid_seq.nextval, :1, handnumberid_seq.nextval)`;
                const sql = `INSERT INTO tt_hands (ID) VALUES (handnumberid_seq.nextval) RETURN ID INTO :id`;
//
//                 const binds = [2, limit, date, ...board, plCount];
//                 const binds = [3];
//
//                 const options = {
//                     autoCommit: true,
//                     bindDefs: [
//                         { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
//                     ]
//                 };

                const result = await this.connection.execute(
                    sql,
                    {id : {type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
                    // options,
                    async (err, result) => {
                        if (result) {
                            await this.connection.commit();
                            console.log('id');
                            console.log(result.outBinds.id);
                        }
                        if (err) {
                            console.error(err.message);
                        }
                    }
                );
                console.log('after result');
                console.log(result);

                // setTimeout(() => {
                //     console.log('result 5sec');
                //     console.log(result);
                // }, 5000);
            } catch (e) {
                console.error(e.message);
            }
        }
    }

    async insertActions() {

    }

    doRelease() {
        if (this.connection) {
            this.connection.close(
                function(err) {
                    if (err)
                        console.error(err.message);
                });
        }
    }
}

// test
const oracle = new Oracle();
setTimeout(() => {
    oracle.addHand();
}, 2000);


class SimulationsQueue {
    constructor() {
        this.activeSimulations = [];
        this.tasksQueue = [];
    }

    tasksHandler() {
        if (this.activeSimulations.length < enumPoker.enumPoker.perfomancePolicy.maxActiveTasks) {
            if (this.tasksQueue.filter(task => task.request.isHeroTurn).length) {

            }
            const task = this.tasksQueue.shift();
            if (task) {
                this.activeSimulations.push(task);

                const getResult = (strategy, handNumber, move_id, playSetup) => {   // sometimes we can get empty callback
                    if (strategy) {
                        playSetup.handPrompt(strategy, handNumber, move_id, playSetup.id);
                    }

                    this.activeSimulations = this.activeSimulations.filter(simulation => simulation.handNumber !== task.handNumber || simulation.move_id !== task.move_id);
                    this.tasksHandler();
                };
                movesHandler.getHill(task.request, getResult);
            }
        }
    };

    queueHandler(handNumber, move_id, request) {
        this.tasksQueue.push({ handNumber, move_id, request });
        this.tasksHandler();
    };

    clearIrrelevantTasks(irrelevantHandNumber) {
        this.tasksQueue = this.tasksQueue.filter(task => task.handNumber !== irrelevantHandNumber);
    }
}

const simulationsQueue = new SimulationsQueue();

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
        this.oracle = new Oracle();
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








