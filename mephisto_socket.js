// const io = require("socket.io");
const io = require('socket.io')(3001);
// const server = io.listen(3001);

// const redis = require('socket.io-redis');
// io.adapter(redis({ host: '192.168.1.20', port: 3001 }));

const moment = require('moment');
const fs = require('fs');

const _ = require('lodash');

const tokens = Object.freeze({
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'clicker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'clicker2',
});

const config = {
    version: 1.12,
    region1: 111,
    region2: 222,
};

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
            console.info(`Client connected [${token}]`);
            client.emit('authorizationSuccess');
            // initialize this client's sequence number
            sequenceNumberByClient.set(token, client);

            // config
            client.on('getConfig', () => {
                // асинхронное чтение
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
                } else {
                    client.emit('frameError', data);
                }
            });

            console.log('sequenceNumberByClient after connection');
            console.log(sequenceNumberByClient);
            client.on('disconnect', () => {
                sequenceNumberByClient.delete(token);
                console.log('sequenceNumberByClient after disconnect');
                console.info(`Client gone [${token}]`);
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