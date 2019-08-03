const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:3001");

const token = 'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj';

// authorization
ioClient.emit('authorization', token);
ioClient.on('authorizationSuccess', () => {
    console.info('authorization success');

    // config
    ioClient.emit('getConfig');
    const frame = {
        id: 1,
        frameInfo: 'frameTest',
    };

    // test frames sending
    // setInterval(() => {
    //     ioClient.emit('frame', frame);
    // }, 1000);
    ioClient.emit('frame', frame);
});

ioClient.on('unauthorizedAccess', () => {
    console.info('Unauthorized Access: please check your token');
});

ioClient.on('frameSuccess', (id) => {
    console.info(`server got frame ${id} successful`);
});

ioClient.on('frameError', (data) => {
    console.info(`frameError: ${data}`);
});

ioClient.on('config', data => {
    console.info(data);
    ioClient.emit('getConfigSuccess');
});

ioClient.on('disconnect', () => {
    console.info('server gone');
});

ioClient.on('prompt', data => {
    console.info('got prompt');
    console.info(data);
    ioClient.emit('getPromptSuccess');
});

