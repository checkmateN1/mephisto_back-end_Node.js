const io = require("socket.io-client");
// const ioClient = io.connect("http://localhost:27990");
const ioClient = io.connect("http://192.168.1.20:27990");

const token = 'dfioulkdgdlb87jkj53pioifjlwlo8cvjksnj';

// authorization
ioClient.emit('authorization', token);
ioClient.on('authorizationSuccess', () => {
    console.info('authorization success');

    // config
    ioClient.emit('getConfig');
    ioClient.emit('getCSS');
    const frame = {
        id: 1,                      // table id. 1,2,3...n
        frameData: 'frameTest',
    };

    // test flow frames sending
    // setInterval(() => {
    //     ioClient.emit('frame', frame);
    // }, 1000);

    // test 1 frame send
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

ioClient.on('css', data => {
    console.info(data);
    ioClient.emit('getCSSSuccess');
});

ioClient.on('disconnect', () => {
    console.info('server gone');
});

ioClient.on('prompt', data => {
    console.info('got prompt');
    console.info(data);
    ioClient.emit('getPromptSuccess');
});

