const exportClient = require('./mephisto_socket');

function errorsHandler(error) {
  console.log(error);

  const client = exportClient.getClient();
  if (client) {
    client.emit('simulationError', error);
  }
}

module.exports.errorsHandler = errorsHandler;