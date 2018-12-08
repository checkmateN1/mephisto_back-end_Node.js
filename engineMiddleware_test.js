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

var PokerEngine = require('./pokerEngine');

const allHandCount = 1326;

const testExpoFunc = () => {
    let sStrategy = Struct({
        invest: int,
        probab: float
    });
    let sStrategyRef = ref.refType(sStrategy);

    let handweight = Struct({
        inputWeight: float,
        strategy: sStrategyRef
    });

    let handweightBuf= new Buffer(handweight.size * 3);

    for (let i = 0; i < 3; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        console.log(el.inputWeight);
        el.strategy = new Buffer(sStrategy.size * 3);
    }

    PokerEngine.GetHill(1, 2, handweightBuf);

    for (let i = 0; i < 3; i++) {
        let el = handweight.get(handweightBuf, i * handweight.size);
        console.log(el.inputWeight);
        for (let j = 0; j < 3; j++) {
            let data3 = ref.reinterpret(el.strategy, sStrategy.size * 3, 0);
            let ss = sStrategy.get(data3, j * sStrategy.size);
            console.log(`ss.invest: ${ss.invest}`);
            console.log(`ss.probab: ${ss.probab}`);
        }
    }
};

//testExpoFunc();


const getCardText = (cardNumber) => {
    let cardText = '';
    switch (cardNumber % 13) {
        case 12:
            cardText = 'A';
            break;
        case 11:
            cardText = 'K';
            break;
        case 10:
            cardText = 'Q';
            break;
        case 9:
            cardText = 'J';
            break;
        case 8:
            cardText = 'T';
            break;
        default:
            cardText = (cardNumber % 13 + 2);
    }

    switch (Math.floor(cardNumber / 13))
    {
        case 0:
            cardText += 'h';
            break;
        case 1:
            cardText += 'd';
            break;
        case 2:
            cardText += 'c';
            break;
        case 3:
            cardText += 's';
            break;
    }
    return cardText;
};


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

    requestHandling(request) {
        // parse request
        // const {act_num, street} = request.request;
        // console.log(`act_num: ${act_num}`);
        // console.log(`street: ${street}`);
        // //(nIDSetup, nIDMove)
        // return middleware.getAllHandsStrategy(this.setupID, act_num + street);
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

sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', 'req');


module.exports.testExpoFunc = testExpoFunc;
module.exports.sessionsListener = sessionsListener;



// Дмитрий Онуфриев, [03.12.18 20:41]
// обявляешь такую структуру:
//
//     Дмитрий Онуфриев, [03.12.18 20:41]
// struct SHiLoCards
// {
//     char hi;
//     char lo;
// };

// std::string ch_card(int card)
// {
//     std::string out;
//     switch (card % 13)
//     {
//         case 12:
//             out = "A";
//             break;
//         case 11:
//             out = "K";
//             break;
//         case 10:
//             out = "Q";
//             break;
//         case 9:
//             out = "J";
//             break;
//         case 8:
//             out = "T";
//             break;
//         default:
//             out = std::to_string(card % 13 + 2);
//     }
//
//     switch (card / 13)
//     {
//         case 0:
//             out += "h";
//             break;
//         case 1:
//             out += "d";
//             break;
//         case 2:
//             out += "c";
//             break;
//         case 3:
//             out += "s";
//             break;
//     }
//     return out;
// }


//
// Дмитрий Онуфриев, [03.12.18 20:42]
// POKERENGINE_API void GetHandsDict(SHiLoCards* dict);
//
// Дмитрий Онуфриев, [03.12.18 20:42]
// передаешь рефТупе(структура)
//
// Дмитрий Онуфриев, [03.12.18 20:42]
// аллокейтишь 1326
//
// Дмитрий Онуфриев, [03.12.18 20:42]
// все как вчера

























