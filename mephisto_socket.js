const { performance } = require('perf_hooks');
// const io = require("socket.io");
const server = require('http').createServer();
const io = require('socket.io')(server, {
    timeout: 600000,       // debug mode with huge freeze timeout
    pingTimeout: 600000,
    reconnection: true,
    reconnectionAttempts: Infinity,
});

const enumPoker = require('./enum');

// const server = io.listen(3001);

// const redis = require('socket.io-redis');
// io.adapter(redis({ host: '192.168.1.20', port: 27990 }));

const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');

const sessionsHandler = require('./sessionsHandler');
const moves = require('./movesHandler');

const sequenceRecognitionClients = {};
const sequencePrompterClients = {};

let exportClient = null;

// const sendPrompt = (client, prompt) => {
//     client.emit('prompt', { prompt });
// };

// debug
let dirPath = 'fake path';
let curFile = '';
let filesInDir = [];

// async function or() {
//     let connection;
//
//     try {
//
//         let sql, binds, options, result;
//
//         connection = await oracledb.getConnection(dbConfig);
//
//         //
//         // Create a table
//         //
//
//         const stmts = [
//             `DROP TABLE no_example`,
//
//             `CREATE TABLE no_example (id NUMBER, data VARCHAR2(20))`
//         ];
//
//         for (const s of stmts) {
//             try {
//                 await connection.execute(s);
//             } catch(e) {
//                 if (e.errorNum != 942)
//                     console.error(e);
//             }
//         }
//
//         //
//         // Insert three rows
//         /=====================================================================================================================================================================================================================================================
//
//         sql = `INSERT INTO no_example VALUES (:1, :2)`;
//
//         binds = [
//             [101, "Alpha" ],
//             [102, "Beta" ],
//             [103, "Gamma" ]
//         ];
//
//         // For a complete list of options see the documentation.
//         options = {
//             autoCommit: true,
//             // batchErrors: true,  // continue processing even if there are data errors
//             bindDefs: [
//                 { type: oracledb.NUMBER },
//                 { type: oracledb.STRING, maxSize: 20 }
//             ]
//         };
//
//         result = await connection.executeMany(sql, binds, options);
//
//         console.log("Number of rows inserted:", result.rowsAffected);
//
//         //
//         // Query the data
//         //
//
//         sql = `SELECT * FROM no_example`;
//
//         binds = {};
//
//         // For a complete list of options see the documentation.
//         options = {
//             outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
//             // extendedMetaData: true,   // get extra metadata
//             // fetchArraySize: 100       // internal buffer allocation size for tuning
//         };
//
//         result = await connection.execute(sql, binds, options);
//
//         console.log("Column metadata: ", result.metaData);
//         console.log("Query results: ");
//         console.log(result.rows);
//
//         //
//         // Show the date.  The value of ORA_SDTZ affects the output
//         //
//
//         sql = `SELECT TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY HH24:MI') AS CD FROM DUAL`;
//         result = await connection.execute(sql, binds, options);
//         console.log("Current date query results: ");
//         console.log(result.rows[0]['CD']);
//
//     } catch (err) {
//         console.error(err);
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error(err);
//             }
//         }
//     }
// }
//
// or();

function getClient() {
    return exportClient;
}

// event fired every time a new client connects:
io.on('connection', client => {
    // authorization
    client.once('authorization', token => {
        if (!(token in enumPoker.tokens)) {
            console.log('unauthorized access');
            client.emit('unauthorizedAccess');
            client.disconnect();
        } else {
            console.info(`Client connected [${token}], id=${client.id}`);
            client.emit('authorizationSuccess');

            exportClient = client;

            // config
            client.on('getConfig', () => {
                fs.readFile('json_config.txt', 'utf8',
                    (error, data) => {
                        if(error) {
                            console.info('error reading config file: json_config.txt');
                        } else {
                            client.emit('config', data);
                            console.log(`sent config to client`);
                            console.log(data);
                        }
                    });
            });
            client.on('getConfigSuccess', () => {
                console.info(`Client [${token}] successfully received config`);
            });

            client.on('startPromptSending', () => {
                // if (!(token in sequencePrompterClients)) {
                //     console.log(`!!!!!!!!!!!!!!!!!!!!########## add client in sequencePrompterClients`);
                //     sequencePrompterClients[token] = client;
                // }
                console.log(`!!!!!!!!!!!!!!!!!!!!########## add client in sequencePrompterClients`);
                sequencePrompterClients[token] = client;
            });

            /////////////// debug
            client.on('getDebugImg', (req) => {
                // console.info('req');
                // console.info(req);
                // trying to serve the image file from the server
                let fileToSend = '';
                if (req) {
                    if (dirPath !== req.folder) {
                        dirPath = req.folder;
                        const files = fs.readdirSync(req.folder);
                        filesInDir = files.filter(file => (/jpg/).test(file))
                            .sort((a, b) => +a.match(/(?<=_)\d*(?=\.jpg)/)[0] - +b.match(/(?<=_)\d*(?=\.jpg)/)[0]);
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
                                client.emit('fileName', { fileToSend });
                            });
                            curFile = fileToSend;
                        }
                    }

                    console.log('fileToSend');
                    console.log(fileToSend);

                    const txtFile = fileToSend.replace('.jpg', '.txt').replace('table', 'json');

                    console.log('txtFile');
                    console.log(txtFile);
                    fs.readFile(req.folder + '\\' + txtFile, 'utf8', (err, data) => {
                        if (err) throw err;
                        let frameData;
                        try {
                            frameData = JSON.parse(data);
                        } catch (error) {
                            console.log(error);
                        }

                        if (frameData) {
                            // initialize this client's sequence number
                            if (!(token in sequenceRecognitionClients)) {
                                sequenceRecognitionClients[token] = client;
                            }

                            const prompterData = {
                                request: {
                                    requestType: 'prompter',
                                },
                                data: frameData,
                                txtFile,
                                client: (token in sequencePrompterClients) ? sequencePrompterClients[token] : null,     // test react-prompter 4 tables
                                // client,                                                                                    // test frame debugger
                            };

                            // console.log(`Enter /// performance.now(): ${performance.now()}`);
                            // sessionsHandler.sessionsListener(token, frameData.id, prompterData);
                            setTimeout(() => {
                                sessionsHandler.sessionsListener(token, frameData.id, prompterData);     // data.id == table id from recognition
                            }, 300);
                        }
                    });
                }
            });

            client.on('autoDebug', (req) => {
                if (req) {
                    const dirPath = req.folder;
                    const fps = req.autoFPS;
                    const foldersPath = fs.readdirSync(dirPath).map(folder => req.folder + `\\${folder}\\json`);
                    console.log('autoDebug /// paths arr');
                    console.log(foldersPath);

                    const intervalFnc = (path, files, fps) => {
                        console.log('files');
                        console.log(files);
                        const generator = function* (arr) {
                            let i = 0;
                            while(true) {
                                yield arr[i];
                                i++;
                                if (i === arr.length) { i = 0; }
                            }
                        };

                        const arrayLoop = generator(files);

                        const dataHandler = () => {
                            console.log(path);
                            console.log(arrayLoop.next());
                            const txtFile = arrayLoop.next().value;

                            fs.readFile(path + '\\' + txtFile, 'utf8', (err, data) => {
                                if (err) { throw err; }
                                let frameData;
                                try {
                                    // console.log('data before parse');
                                    // console.log(data);
                                    frameData = JSON.parse(data);
                                } catch (error) {
                                    console.log(error);
                                }

                                if (frameData) {
                                    const prompterData = {
                                        request: {
                                            requestType: 'prompter',
                                        },
                                        data: frameData,
                                        txtFile,
                                        txtPath: path,
                                        client: (token in sequencePrompterClients) ? sequencePrompterClients[token] : null,     // test react-prompter 4 tables
                                        // client,                                                                                  // test frame debugger
                                    };

                                    setTimeout(() => {
                                        sessionsHandler.sessionsListener(token, frameData.id, prompterData);     // data.id == table id from recognition
                                    }, 0);
                                }
                            });
                        };

                        (function loop() {
                            const rand = Math.round(Math.random() * fps * 200) + fps * 900;
                            setTimeout(function() {
                                dataHandler();
                                loop();
                            }, rand);
                        }());
                    };

                    foldersPath.forEach(path => {
                        const files = fs.readdirSync(path);
                        const filesInDir = files.filter(file => (/txt/).test(file))
                            .sort((a, b) => +a.match(/(?<=_)\d*(?=\.txt)/)[0] - +b.match(/(?<=_)\d*(?=\.txt)/)[0]);

                        intervalFnc(path, filesInDir, fps);
                    });
                }
            });

            client.on('clearDebug', () => {
                curFile = '';
            });

            client.on('pauseDebug', () => {
                curFile = '';
            });

            client.on('playDebug', () => {
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
                // console.log('data');
                // console.log(data);

                console.log('token');
                console.log(token);

                if (!_.isEmpty(data)) {
                    console.log(`got frame at ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
                    client.emit('frameSuccess', data.id);
                    // const frameData = JSON.parse(data);

                    fs.appendFileSync('frames_log.txt',
                        `got frame at ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')} \r\n
                        ${data.toString()} \r\n \r\n \r\n`,
                        function(error){
                        if(error) {throw error;} // если возникла ошибка
                    });

                    const prompterData = {
                        request: {
                            requestType: 'prompter',
                        },
                        data,
                        client: (token in sequencePrompterClients) ? sequencePrompterClients[token] : null,
                    };

                    console.log('token in sequencePrompterClients');
                    console.log(token in sequencePrompterClients);

                    // console.log('prompterData.client');
                    // console.log(prompterData.client);

                    console.log('data.id');
                    console.log(data.id);

                    sessionsHandler.sessionsListener(token, data.id, prompterData);
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
                    //
                    // setTimeout(() => {
                    //     client.emit('simulationsResponse', {test: 100500});
                    // }, 50);

                    // (async function() {
                    //     const result = await sessionsHandler.sessionsListener(token, client.id, data);
                    //     client.emit('simulationsResponse', result);
                    // })();

                    async function testAcync() {
                        const result = await sessionsHandler.sessionsListener(token, client.id, data);
                        // console.log('result', result);
                        if (result) {
                            client.emit('simulationsResponse', result);
                        }
                    }

                    testAcync().then(console.log('result sucsess'));

                    // const result = sessionsHandler.sessionsListener(token, client.id, data);
                    // client.emit('simulationsResponse', result);

                } else {
                    client.emit('simulationsError', data);
                }
            });

            client.on('getGenerationsNames', () => {
                client.emit('generationsNames', moves.generationsNames);
            });

            client.on('setGeneration', generation => {
                if (generation) {
                    console.log('setGeneration', generation);
                    moves.changeAddonPath(generation);
                    client.emit('setGenerationSuccess');
                } else {
                    client.emit('generationError', data);
                }
            });

            client.on('saveSetup', data => {
                if (!_.isEmpty(data)) {
                    client.emit('saveSetupSuccess');

                    console.log(data);

                    fs.writeFile(__dirname + `/savedSetups/${data.fileName}_____${moment().format('DD-MM-YYYY-HH-mm')}.txt`, JSON.stringify(data), (err) => {
                        // throws an error, you could also catch it here
                        if (err) throw err;

                        // success case, the file was saved
                        console.log('saved setup!');
                    });
                } else {
                    client.emit('saveSetupError');
                }
            });

            client.on('openSetups', () => {
                const files = fs.readdirSync(__dirname + `/savedSetups`);
                console.log(files);

                if (files.length) {
                    client.emit('setupsList', files);
                }
            });

            client.on('openSetup', fileName => {
                if (fileName) {
                    console.log(`got openSetup request from simulator. fileName: ${fileName}`);

                    fs.readFile(__dirname + `/savedSetups/${fileName}`, 'utf8',
                        (error, data) => {
                            if(error) {
                                console.info(`error reading file: ${__dirname}/savedSetups/${fileName}`);
                            } else {
                                client.emit('openSetupSuccess', JSON.parse(data));
                            }
                    });
                }
            });

            client.on('preOpenSetup', fileName => {
                if (fileName) {
                    console.log(`got openSetup request from simulator. fileName: ${fileName}`);

                    fs.readFile(__dirname + `/savedSetups/${fileName}`, 'utf8',
                        (error, data) => {
                            if(error) {
                                console.info(`error reading file: ${__dirname}/savedSetups/${fileName}`);
                            } else {
                                client.emit('preOpenSetupSuccess', JSON.parse(data).fileDescription);
                            }
                        }
                    );
                }
            });

            client.on('disconnect', () => {
                console.info(`Client gone [${client.id}]`);

                if (sequenceRecognitionClients[token] && client.id === sequenceRecognitionClients[token].id) {
                    delete sequenceRecognitionClients[token];
                } else if (sequencePrompterClients[token] && client.id === sequencePrompterClients[token].id) {
                    delete sequencePrompterClients[token];
                }
            });
        }
    });
});

// server.listen(27991, '192.168.1.40', function() {        // fatal1ty
//     console.log("Сервер ожидает подключения...");
// });

// server.listen(27991, '192.168.1.30', function() {        // lucifer
//     console.log("Сервер ожидает подключения...");
// });


if (enumPoker.enumPoker.perfomancePolicy.isSimulatorOnly) {
    server.listen(27990, '192.168.1.20', function() {        // mephisto
        console.log("Сервер ожидает подключения...");
    });
} else {
    server.listen(27990, '192.168.1.105', function() {        // laptop
        console.log("Сервер ожидает подключения...");
    });
}


// server.listen(27990, 'localhost', function() {
//     console.log("Сервер ожидает подключения...");
// });

// server.listen(27990, '192.168.1.105', function() {        // laptop
//     console.log("Сервер ожидает подключения...");
// });

// http://212.22.223.151:27990  - внешний ip

module.exports.getClient = getClient;