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

// const initSetup = async () => await PokerEngine.InitSetup();
// const releaseSetup = async (idSetup) => await PokerEngine.ReleaseSetup(idSetup);
// const setPlayer = async (idSetup, stack, position, adaptation) => await PokerEngine.SetPlayer(idSetup, stack, position, adaptation);
//



// let sStrategy = Struct({
//     invest: int,
//     probab: float
// });
// var sStrategyArray = ArrayType(sStrategy);
//
// var handweight = Struct({
//     inputWeight: float,
//     strategy: sStrategyArray
// });




// all users sessions
const sessions = {};

const tokens = Object.freeze({
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'cliker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'cliker2',
});

const sessionTimeout = 4;
const setupTimeout = 2;

// one specific user with many SessionSetups
class Session {
    constructor(sessionID) {
        this.setups = {};
        this.timeout = sessionTimeout;
        this.setups[sessionID] = new SessionSetup(PokerEngine.InitSetup());
        this.setups[sessionID].timerToDestroy = setInterval(() => {
            this.setups[sessionID].timeout--;
            if (this.setups[sessionID].timeout < 0) {
                clearInterval(this.setups[sessionID].timerToDestroy);
                PokerEngine.ReleaseSetup(this.setups[sessionID].setupID);
                delete this.setups[sessionID];
                console.log('bom bom');
            }
        }, 1000);
    }
}

// one specific table/simulator inside Session
class SessionSetup {
    constructor(setupID) {
        this.setupID = setupID; // PokerEngine session number
        this.timeout = setupTimeout;
    }

    async requestHandling(request) {
        // parse request

        //return await PokerEngine.getStrategy();
    }

    releaseSetup() {return PokerEngine.ReleaseSetup(this.setupID)}
    setPlayer(stack, position, adaptation) {return PokerEngine.SetPlayer(this.setupID, stack, position, adaptation)}
    getStrategy() {return true}

}

// calls every time when request comes to the server
const sessionsListener = (token, sessionID, request) => {
    if (token in sessions) {
        sessions[token].timeout = sessionTimeout;                       // reset timer to destroy session
        if (sessionID in sessions[token].setups) {
            sessions[token].setups[sessionID].timeout = setupTimeout;   // reset timer to destroy setup
            return sessions[token].setups[sessionID].requestHandling(request);
        }
        sessions[token].setups[sessionID] = new SessionSetup(PokerEngine.InitSetup());
        return sessions[token].setups[sessionID].requestHandling(request);
    } else if (token in tokens) {
        sessions[token] = new Session(sessionID);
        sessions[token].timerToDestroy = setInterval(() => {
            sessions[token].timeout--;
            if (sessions[token].timeout < 0) {
                clearInterval(sessions[token].timerToDestroy);
                delete sessions[token];
                console.log('bom bom!!!!!');
            }
        }, 1000);
        return sessions[token].setups[sessionID].requestHandling(request);
    }
};

//
// module.exports.sessionsListener = sessionsListener;
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
   "request": {
      "type": "strategy",
      "street": "turn",
      "act_num": 1
   }
}

 */






























// var i = 10;
// setInterval(function() {
//     func(i);
// }, 100);

// const timeOut = 10000;
//
//
// let timer = (bool) => {
//     let timeout = 10000;
//     console.log('yo');
//     sessions = setTimeout(timer, 2000);
// };
//
// var sessions = setTimeout(timer , 2000);

// let newSetup = initSetup();
// console.log(newSetup);
//
// let addPL1 = PokerEngine.SetPlayer(newSetup, 100, 0, [1.1, 2.2, 3.3]);
// let addPL2 = PokerEngine.SetPlayer(newSetup, 100, 8, [1, 2, 3]);
// let addPL3 = PokerEngine.SetPlayer(newSetup, 100, 0, [1, 2, 3]);
// let addPL4 = PokerEngine.SetPlayer(100, 100, 0, [1, 2, 3]);







//console.log(``);
// console.log(PokerEngine.InitSetup());
//console.log(releaseSetup(newSetup));

//let newSetup = PokerEngine.AddPlayer(5, 5, 5, arrInt);





// try {
//     var AddPlayer = require('./math');
//     var result = null;
//     var result2 = null;
//
//     var b = [1.1, 999.7, 3.3];
//     var arrInt = new IntArray(b);
//     result = AddPlayer.AddPlayer(5, 5, 5, arrInt);
//
//
//     var a = [0.1, 1.1, 2.1];
//     var array = ref.alloc(double, 3);
//
//     result2 = AddPlayer.GetHill(array);
//     var data = ref.reinterpret(array, double.size * 3, 0);
//     for (var i = 0; i < 3; i++) {
//         console.log(double.get(data, i * double.size));
//     }
// } catch (e) {
//     console.log(e);
// }



// test
//
// var Data = Struct({
//     hand: int,
//     ev: int,
// });
// var obj = {
//     foo: 2,
//     food: 5,
// };
// var buf = ref.alloc('Object', obj);
//
// var obj2 = ref.readObject(buf, 0);
// var obj3 = ref.deref(buf);
// //console.log(obj === obj2);
// //console.log(obj2);
// console.log(obj3);

var pokerEngine = require('./pokerEngine');
// var result = null;
// var result2 = null;
//
// var b = [1.1, 999.7, 3.3];
// var arrInt = new IntArray(b);
// result = AddPlayer.AddPlayer(5, 5, 5, arrInt);
//
// var a = [0.1, 1.1];
var array = ref.alloc(double, 3);

result2 = pokerEngine.GetHill(array);
var data = ref.reinterpret(array, double.size * 3, 0);
for (var i = 0; i < 3; i++) {
    console.log(double.get(data, i * double.size));
}







