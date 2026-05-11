const { createApp } = require('./app');
const { env } = require('./config/env');

const { server } = createApp();

server.listen(env.port, () => {
  process.stdout.write(`Server listening on port ${env.port}\n`);
});
