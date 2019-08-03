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
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'clicker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'clicker2',
});

const sequenceNumberByClient = new Map();


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
            sequenceNumberByClient.set(client, token);

            const testNickname = 'testTEST';
            let currentPrompt =
                `<div class="main-container spins party-poker">
                    <div class="player player0">
                        <div class="nickname green">${testNickname}</div>
                        <div class="stats row">
                            <span class="stat green">VPIP: 54, </span><span class="stat">PFR: 19, </span><span class="stat">3Bet: 13</span>
                        </div>
                        <div class="stats row">
                            <span class="stat">CBet: 45, </span><span class="stat green">Raise%: 9, </span><span class="stat">Call%: 55</span>
                        </div>
                    </div>
                    <div class="player player1">
                        <div class="nickname red">checkmate</div>
                        <div class="stats row">
                            <span class="stat red">VPIP: 17, </span><span class="stat">PFR: 16, </span><span class="stat">3Bet: 20</span>
                        </div>
                        <div class="stats row">
                            <span class="stat">CBet: 65, </span><span class="stat red">Raise%: 25, </span><span class="stat">Call%: 42</span>
                        </div>
                    </div>
                    <div class="player player2">
                        <div class="nickname">See my luck</div>
                        <div class="stats row">
                            <span class="stat">VPIP: 30, </span><span class="stat">PFR: 23, </span><span class="stat">3Bet: 15</span>
                        </div>
                        <div class="stats row">
                            <span class="stat">CBet: 55, </span><span class="stat">Raise%: 12, </span><span class="stat">Call%: 40</span>
                        </div>
                    </div>
                    <div class="prompt">
                        <div class="bet-raise">
                            Raise: 285bb
                        </div>
                        <div class="diagram">
                            <div class="fold" style="width: 10%"></div>
                            <div class="check-call" style="width: 35%"></div>
                            <div class="bet-raise" style="width: 55%"></div>
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

            // frames
            client.on('frame', data => {
                if (!_.isEmpty(data)) {
                    console.log(`got frame at ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
                    console.log(data);
                    client.emit('frameSuccess', data.id);
                    client.emit('prompt', currentPrompt);
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
                        const result = await sessionsHandler.sessionsListener('uidfksicnm730pdemg662oermfyf75jdf9djf', client.id, data);
                        client.emit('simulationsResponse', result);
                    })();

                } else {
                    client.emit('simulationsError', data);
                }
            });

            client.on('disconnect', () => {
                sequenceNumberByClient.delete(client);
                console.info(`Client gone [${client.id}]`);
            });
        }
    });
});


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