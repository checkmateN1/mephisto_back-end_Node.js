const io = require("socket.io");
const server = io.listen(3001);
const _ = require('lodash');

const tokens = Object.freeze({
    'uidfksicnm730pdemg662oermfyf75jdf9djf': 'simulator',
    'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj': 'cliker1',
    '872k4j2k3mc8uvxoiaklsjfsdfudyjhm45nuu': 'cliker2',
});

const config = {
    version: 1.12,
    region1: 111,
    region2: 222,
};

const sequenceNumberByClient = new Map();

// event fired every time a new client connects:
server.on("connection", client => {
    // authorization
    client.on('authorization', token => {
        if (!(token in tokens)) {
            console.log('unauthorized access');
            client.emit('authorizationFail');
        } else {

        }
        console.log(token);
        client.emit('authorizationSuccess');

        console.info(`Client connected [id=${client.id}]`);
        // initialize this client's sequence number
        sequenceNumberByClient.set(client.id, {});

        // config
        client.on('getConfig', () => {
            client.emit('config', config);
            client.on('getConfigSuccess', () => {
                console.info(`Client [id=${client.id}] successfully received config`);
            });
        });

        // frames
        client.on('frame', data => {
            if (!_.isEmpty(data)) {
                console.log(data);
                client.emit('frameResponseSuccess');
            }
        });
    });

    // when socket disconnects, remove it from the list:
    client.on("disconnect", () => {
        sequenceNumberByClient.delete(client);
        console.info(`Client gone [id=${client.id}]`);
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