const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:3001");

const token = 'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj';

ioClient.on('connect', () => {

});

// authorization
ioClient.emit('authorization', token);
ioClient.on('authorizationSuccess', () => {
    console.log('authorization success');
});

// config
ioClient.emit('getConfig');
ioClient.on('config', data => {
    console.log(data);
    ioClient.emit('getConfigSuccess');
});

ioClient.on('disconnect', () => {
    console.log('server gone');
});


