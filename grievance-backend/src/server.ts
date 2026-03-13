if (process.env.NODE_ENV !== 'production') {
  (await import('dotenv')).config();
}

import http, { type Server } from 'http';
import app from './index.js';
import config from './config/index.js';
import { DatabaseConnection } from './db/connections.js';

const server: Server = http.createServer(app);

async function start() {
  const PORT: number = Number(process.env.PORT) || Number(config.server.port) || 3000;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[ server ] running on port ${PORT}`);
  });

  try {
    console.log('[ server ] Checking environment variables...');
    // ... your logging ...

    // 2. Attempt DB connection
    await DatabaseConnection();
    console.log('[ server ] Database connected successfully');
    // Inside your start() function
    console.log(`[ server ] DB_HOST: ${process.env.DB_HOST}`);
    console.log(`[ server ] DB_USER: ${process.env.DB_USER}`);

  } catch (err) {
    console.error('[ server ] Database connection failed, but server is still up.');
    console.error(err);
    // REMOVE process.exit(1); -> Keeping the process alive stops the 502
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