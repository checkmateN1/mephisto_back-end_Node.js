// const io = require("socket.io");
const io = require('socket.io')(3001);
// const server = io.listen(3001);

// const redis = require('socket.io-redis');
// io.adapter(redis({ host: '192.168.1.20', port: 3001 }));

const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');

const sessionsHandler = require('./sessionsHandler');

const tokens = Object.freeze({
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator Ivan',
    'uidfksicnm730pdemg662oermfyf75jdf9djk': 'simulator Molot-ok',
    'uidfksicnm730pdemg662oermfyf75jdf9djj': 'simulator checkmate',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'clicker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'clicker2',
});

const sequenceNumberByClient = {};

const sendPrompt = (clientID, prompt) => {
    for (let key in sequenceNumberByClient) {
        const client = sequenceNumberByClient[key].client;      // clientID instead of key
        client.emit('prompt', { prompt: 'testPrompt' });
    }
};

setInterval(() => {
    console.log('trying to emit test prompt');
    sendPrompt();
}, 5000);


// event fired every time a new client connects:
io.on('connection', client => {
    // authorization
    client.on('authorization', token => {
        if (!(token in tokens)) {
            console.log('unauthorized access');
            client.emit('unauthorizedAccess');
            client.disconnect();
        } else {
            console.info(`Client connected [${token}], id=${client.id}`);
            client.emit('authorizationSuccess');
            // initialize this client's sequence number
            sequenceNumberByClient[client.id] = { client, token };

            const testNickname = 'testTEST';
            let currentPrompt =
                `<div class="main-container spins party-poker">
    <div class="player player0">
        <div class="nickname green">Joe <span class="balance">/ 23bb</span></div>
        <div>
            <span class="stat green">VPIP: 54, </span><span class="stat">PFR: 19, </span><span class="stat">3Bet: 13</span>
        </div>
        <div>
            <span class="stat">CBet: 45, </span><span class="stat green">Raise%: 9, </span><span class="stat">Call%: 55</span>
        </div>
        <div class="dealer"><span>D</span></div>
        <div class="amount bet-raise">bet: 5bb</div>
    </div>
    <div class="player player1">
        <div class="nickname red">checkmate <span class="balance">/ 16bb</span></div>
        <div>
            <span class="stat red">VPIP: 17, </span><span class="stat">PFR: 16, </span><span class="stat">3Bet: 20</span>
        </div>
        <div>
            <span class="stat">CBet: 65, </span><span class="stat red">Raise%: 25, </span><span class="stat">Call%: 42</span>
        </div>
        <div class="amount check-call">check</div>
    </div>
    <div class="player player2">
        <div class="nickname">See my luck <span class="balance">/ 27bb</span></div>
        <div>
            <span class="stat">VPIP: 30, </span><span class="stat">PFR: 23, </span><span class="stat">3Bet: 15</span>
        </div>
        <div>
            <span class="stat">CBet: 55, </span><span class="stat">Raise%: 12, </span><span class="stat">Call%: 40</span>
        </div>
    </div>
    <div class="board">
        <div class="pot">Pot: 10bb</div>
        <div class="card spades">
            <div class="value">A</div>
            <div class="suit">&#9824</div>
        </div>
        <div class="card clubs">
            <div class="value">8</div>
            <div class="suit">&#9827</div>
        </div>
        <div class="card hearts">
            <div class="value">T</div>
            <div class="suit">&#9829</div>
        </div>
        <div class="card diamonds">
            <div class="value">Q</div>
            <div class="suit">&#9830</div>
        </div>
        <div class="card diamonds">
            <div class="value">2</div>
            <div class="suit">&#9830</div>
        </div>
    </div>
    <div class="hero-hand">
        <div class="card diamonds">
            <div class="value">T</div>
            <div class="suit">&#9830</div>
        </div>
        <div class="card spades">
            <div class="value">T</div>
            <div class="suit">&#9824</div>
        </div>
    </div>
    <div class="prompt">
        <div class="bet-raise red">
            Raise: 25bb
        </div>
        <div class="diagram">
            <div class="fold" style="width: 10%"></div>
            <div class="check-call" style="width: 35%"></div>
            <div class="bet-raise" style="width: 55%"></div>
        </div>
        <div class="sizings">
            <table>
                <tr style="opacity: 0.25">
                    <td class="check-call">Call</td>
                    <td class="ev">EV: 5bb</td>
                </tr>
                <tr style="opacity: 0.3">
                    <td class="bet-raise">Raise: 1pot</td>
                    <td class="ev">EV: 10bb</td>
                </tr>
                <tr style="opacity: 0.5">
                    <td class="bet-raise">Raise: 1.6pot</td>
                    <td class="ev">EV: 13bb</td>
                </tr>
                <tr>
                    <td class="bet-raise">Raise: 2.5pot</td>
                    <td class="ev">EV: 15bb</td>
                </tr>
                <tr style="opacity: 0.7">
                    <td class="bet-raise">All-in</td>
                    <td class="ev">EV: 14bb</td>
                </tr>
            </table>
        </div>
    </div>
</div>`;

            // config
            client.on('getConfig', () => {
                fs.readFile('json_config.txt', 'utf8',
                    (error, data) => {
                        if(error) {
                            console.info('error reading config file: json_config.txt');
                        } else {
                            client.emit('config', data);
                        }
                    });
            });
            client.on('getConfigSuccess', () => {
                console.info(`Client [${token}] successfully received config`);
            });

            // css
            client.on('getCSS', () => {
                fs.readFile('prompt.css', 'utf8',
                    (error, data) => {
                        if(error) {
                            console.info('error reading style file: prompt.css');
                        } else {
                            client.emit('css', data);
                        }
                    });
            });
            client.on('getCSSSuccess', () => {
                console.info(`Client [${token}] successfully received prompter .css file`);
            });

            // frames and prompts
            client.on('frame', data => {
                if (!_.isEmpty(data)) {
                    console.log(`got frame at ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
                    console.log(data);
                    client.emit('frameSuccess', data.id);

                    // test prompt
                    client.emit('prompt', currentPrompt);

                    const prompterData = {
                        request: {
                            requestType: 'prompter',
                        },
                        data,
                    };

                    sessionsHandler.sessionsListener(token, client.id, prompterData);
                } else {
                    client.emit('frameError', data);
                }
            });
            client.on('getPromptSuccess', () => {
                console.info('client got prompt success');
            });

            // simulations
            client.on('simulations', data => {
                if (!_.isEmpty(data)) {
                    client.emit('simulationsSuccess');

                    console.log(data);

                    (async function() {
                        const result = await sessionsHandler.sessionsListener(token, client.id, data);
                        client.emit('simulationsResponse', result);
                    })();

                } else {
                    client.emit('simulationsError', data);
                }
            });

            client.on('disconnect', () => {
                delete sequenceNumberByClient[client.id];

                // sequenceNumberByClient.delete(client.id);
                console.info(`Client gone [${client.id}]`);
            });
        }
    });
});

module.exports.sendPrompt = sendPrompt;


// const sessionsHandler = require('./sessionsHandler');
//
// const oracledb = require('oracledb');
// const bodyParser = require('body-parser');
//
// app.use(bodyParser.json());       // to support JSON-encoded bodies
// app.use(express.json());       // to support JSON-encoded bodies
//
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
//     next();
// });

// app.listen(3001, "localhost", function(){
//     console.log("Сервер ожидает подключения...");
// });

//console.log(testExpoFunc.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', '123', 'yo!'));
// app.listen(27990, "192.168.1.20", function(){
//     console.log("Сервер ожидает подключения...");
// });