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

// const sendPrompt = (client, prompt) => {
//     client.emit('prompt', { prompt });
// };


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

                    const prompterData = {
                        request: {
                            requestType: 'prompter',
                        },
                        data,
                        client,
                    };

                    sessionsHandler.sessionsListener(token, data.id, prompterData);     // data.id == table id from recognition
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
                console.info(`Client gone [${client.id}]`);
            });
        }
    });
});