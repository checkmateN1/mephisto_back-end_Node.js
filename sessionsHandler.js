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


// all users sessions.. 1 token = 1 session
const sessions = {};

const tokens = Object.freeze({
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'cliker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'cliker2',
});

const sessionTimeout = 50;
const setupTimeout = 15;
const timeoutStep = 5000;

// one specific user with many SessionSetups
class Session {
    constructor(setupID, bbSize) {
        this.setups = {};
        this.timeout = sessionTimeout;
        this.setups[setupID] = new SessionSetup(PokerEngine.InitSetup(bbSize), bbSize);
        this.setups[setupID].timerToDestroy = setInterval(() => {
            this.setups[setupID].timeout--;
            if (this.setups[setupID].timeout < 0) {
                clearInterval(this.setups[setupID].timerToDestroy);
                PokerEngine.ReleaseSetup(this.setups[setupID].setupID);
                console.log(`setup ${setupID} over and will be remove`);
                delete this.setups[setupID];
            }
        }, timeoutStep);
    }
}

// one specific table/simulator inside Session
class SessionSetup {
    constructor(setupID, bbSize) {
        this.setupID = setupID; // PokerEngine session number
        this.timeout = setupTimeout;
        this.bbSize = bbSize;
        this.actions = {};
        this.players = [];
        this.IdMoveForSimul = 0;
    }

    requestHandling(request) {
        // parse request
        const { requestType } = request.request;

        // simulator strategy
        if (requestType === 'strategy') {
            const { act_num, street } = request.request;
            let bbSize = parseInt(Math.max(parseFloat(request.actions.preflop[0].amount), parseFloat(request.actions.preflop[1].amount)) * 100);

            this.setupID = moves.movesHandler(this.setupID, this.actions, request, bbSize, this);

            return middleware.getAllHandsStrategy(this.setupID, (act_num + street));
        }
        // last move hero simulation for prompter
        if (requestType === 'prompter') {
            prompterHandler.prompterListener(this.setupID, request);
        }
    }

    releaseSetup() { return PokerEngine.ReleaseSetup(this.setupID) }
    setPlayer(stack, position, adaptation) { return PokerEngine.SetPlayer(this.setupID, stack, position, adaptation) }
}

// calls every time when request comes to the server
const sessionsListener = (token, setupID, request) => {
    if (!(token in tokens)) {
        console.log('unauthorized access');
        return 'unauthorized access';
    }

    const { requestType } = request.request;
    let bbSize;

    if (requestType !== 'prompter') {
        bbSize = parseInt(Math.max(parseFloat(request.actions.preflop[0].amount), parseFloat(request.actions.preflop[1].amount)) * 100);
    }

    if (token in sessions) {
        sessions[token].timeout = sessionTimeout;                              // reset timer to destroy session
        if (setupID in sessions[token].setups) {
            sessions[token].setups[setupID].timeout = setupTimeout;           // reset timer to destroy setup
            return sessions[token].setups[setupID].requestHandling(request);
        }

        if (requestType === 'prompter') {
            sessions[token].setups[setupID] = new SessionSetup(prompterHandler.getBBsize(setupID, request));
            return sessions[token].setups[setupID].requestHandling(request);
        }

        sessions[token].setups[setupID] = new SessionSetup(PokerEngine.InitSetup(bbSize));
        return sessions[token].setups[setupID].requestHandling(request);
    }

    if (requestType === 'prompter') {
        sessions[token] = new Session(setupID, prompterHandler.getBBsize(setupID, request));
    } else {
        sessions[token] = new Session(setupID, bbSize);
    }

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
// module.exports.SessionSetup = SessionSetup;
// module.exports.Session = Session;
// module.exports.sessionTimeout = sessionTimeout;
// module.exports.setupTimeout = setupTimeout;
// module.exports.tokens = tokens;
// module.exports.sessions = sessions;

//sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', 'req');




/* result JSON to server
{
   "hand": {
      "lm": 0.25,
      "c1": "Ac",
      "c2": "6h",
      "c3": "Kd",
      "c4": "Js"
   },
   "players": [
      {
         "name": "mammoth",
         "position": "SB",
         "stack": 25.15,
         "bet": 0.1,
         "hole1": "Ah",
         "hole2": "Kc"
      },
      {
         "name": "checkmateN1",
         "position": "BB",
         "stack": 37.25,
         "bet": 0.25
      },
      {
         "name": "gulyaka",
         "position": "MP2",
         "stack": 27,
         "bet": 0
      },
      {
         "name": "zlo-Mishka",
         "position": "MP3",
         "stack": 32,
         "bet": 0
      },
      {
         "name": "3D action",
         "position": "CO",
         "stack": 45.37,
         "bet": 0
      },
      {
         "name": "joooe84",
         "position": "BTN",
         "stack": 60,
         "bet": 0.75
      }
   ],
   "actions": {
      "preflop": [
         {
            "act_num": 1,
            "player": "gulyaka",
            "balance": 27,
            "action": "fold",
            "pot": 0.35
         },
         {
            "act_num": 2,
            "player": "zlo-Mishka",
            "balance": 32,
            "action": "fold",
            "pot": 0.35
         },
         {
            "act_num": 3,
            "player": "3D action",
            "balance": 45.37,
            "action": "fold",
            "pot": 0.35
         },
         {
            "act_num": 4,
            "player": "joooe84",
            "balance": 60,
            "action": "raise",
            "pot": 0.35,
            "amount": 0.75
         },
         {
            "act_num": 5,
            "player": "mammoth",
            "balance": 25.05,
            "action": "call",
            "pot": 1.1,
            "amount": 0.75
         },
         {
            "act_num": 6,
            "player": "checkmateN1",
            "balance": 37,
            "action": "call",
            "pot": 1.75,
            "amount": 0.75
         }
      ],
      "flop": [
         {
            "act_num": 7,
            "player": "mammoth",
            "balance": 24.4,
            "action": "check",
            "pot": 2.25
         },
         {
            "act_num": 8,
            "player": "checkmateN1",
            "balance": 36.5,
            "action": "check",
            "pot": 2.25
         },
         {
            "act_num": 9,
            "player": "joooe84",
            "balance": 59.25,
            "action": "bet",
            "pot": 2.25,
            "amount": 1.6
         },
         {
            "act_num": 10,
            "player": "mammoth",
            "balance": 24.4,
            "action": "call",
            "pot": 3.85,
            "amount": 1.6
         },
         {
            "act_num": 11,
            "player": "checkmateN1",
            "balance": 36.5,
            "action": "call",
            "pot": 5.45,
            "amount": 1.6
         }
      ],
      "turn": [
         {
            "act_num": 12,
            "player": "mammoth",
            "balance": 22.8,
            "action": "bet",
            "pot": 7.05,
            "amount": 4
         },
         {
            "act_num": 13,
            "player": "checkmateN1",
            "balance": 34.9,
            "action": "raise",
            "pot": 11.05,
            "amount": 34.9
         },
         {
            "act_num": 14,
            "player": "joooe84",
            "balance": 57.65,
            "action": "raise",
            "pot": 45.95,
            "amount": 57.65
         }
      ]
   },
   "requeыфяst": {
      "type": "strategy",
      "street": "turn",
      "act_num": 1
   }
}

 */








