import http, { type Server } from 'http';
import app from './index.js';
import config from './config/index.js';
import { DatabaseConnection } from './db/connections.js';

const server: Server = http.createServer(app);

async function start() {
  try {
    await DatabaseConnection();

    const PORT = process.env.PORT || config.server.port || 3000;

    server.listen(PORT, () => {
      console.log(`[ server ] running on ${PORT}`);
    });

  } catch (err) {
    console.error('[ server ] startup failed!');
    console.error(err);
    process.exit(1);
  }
}

function shutdown(signal: string) {
  console.log(`[ server ] received ${signal}. Shutting down...`);
  server.close(() => {
    console.log('[ server ] closed.');
    process.exit(0);
  });
}

start();

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));







// import http, { type Server } from 'http';
// import app from './index.js';
// import config from './config/index.js';
// import { DatabaseConnection } from './db/connections.js';

// const server: Server = http.createServer(app);

// async function start() {
//   try {
//     await DatabaseConnection();
//     server.listen(config.server.port, () => {
//       console.log(`[ server ] running on ${config.server.port}`);
//     });
//   } catch (err) {
//     console.error('[ server ] startup failed!');
//     console.error(err);
//     process.exit(1);
//   }
// }


// function shutdown(signal: string) {
//   console.log(`[ server ] received ${signal}. Shutting down...`);
//   server.close(() => {
//     console.log('[ server ] closed.');
//     process.exit(0);
//   });
// }

// start();


// process.on('SIGINT', () => shutdown('SIGINT'));
// process.on('SIGTERM', () => shutdown('SIGTERM'));