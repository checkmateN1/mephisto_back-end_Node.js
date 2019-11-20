// const io = require("socket.io");
const server = require('http').createServer();
const io = require('socket.io')(server);
// const server = io.listen(3001);

// const redis = require('socket.io-redis');
// io.adapter(redis({ host: '192.168.1.20', port: 27990 }));

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

// debug
let dirPath = '';
let curFile = '';
let filesInDir = [];


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

            /////////////// debug
            client.on('getDebugImg', (req) => {
                console.info('req');
                console.info(req);
                // trying to serve the image file from the server
                let fileToSend = '';
                if (req) {
                    if (dirPath !== req.folder) {
                        dirPath = req.folder;
                        const files = fs.readdirSync(req.folder);
                        filesInDir = files.filter(file => /jpg/.test(file));
                        fileToSend = req.file;
                        fs.readFile(req.folder + '\\' + req.file, function(err, buf){
                            if (err) throw err; // Fail if the file can't be read.
                            client.emit('image', { image: true, buffer: buf.toString('base64') });
                            console.log('image file is initialized');
                            curFile = req.file;
                        });
                    } else {
                        fileToSend = curFile ? filesInDir[filesInDir.indexOf(curFile) + req.step] : req.file;
                        if (fileToSend !== undefined) {
                            fs.readFile(req.folder + '\\' + fileToSend, function(err, buf){
                                if (err) throw err; // Fail if the file can't be read.
                                client.emit('image', { image: true, buffer: buf.toString('base64') });
                                console.log('image file is initialized');
                            });
                            curFile = fileToSend;
                        }
                    }

                    const txtFile = fileToSend.replace('.jpg', '.txt').replace('table', 'json');
                    fs.readFile(req.folder + '\\' + txtFile, 'utf8', (err, data) => {
                        if (err) throw err;
                        const frameData = JSON.parse(data);

                        const prompterData = {
                            request: {
                                requestType: 'prompter',
                            },
                            data: frameData,
                            client,
                        };

                        sessionsHandler.sessionsListener(token, frameData.id, prompterData);     // data.id == table id from recognition
                    });
                }
            });

            client.on('clearDebug', () => {
                curFile = '';
            });

            //////////////////////////////////////////

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
                    client.emit('frameSuccess', data.id);
                    const frameData = JSON.parse(data);

                    fs.appendFileSync('frames_log.txt',
                        `got frame at ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')} \r\n
                        ${data} \r\n \r\n \r\n`,
                        function(error){
                        if(error) throw error; // если возникла ошибка
                    });

                    const prompterData = {
                        request: {
                            requestType: 'prompter',
                        },
                        data: frameData,
                        client,
                    };

                    sessionsHandler.sessionsListener(token, frameData.id, prompterData);     // data.id == table id from recognition
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

// server.listen(27990, '192.168.1.20', function(){
//     console.log("Сервер ожидает подключения...");
// });

server.listen(27990, 'localhost', function(){
    console.log("Сервер ожидает подключения...");
});