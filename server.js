/******************************************************************
 * 🔥 LOAD ENV FIRST — BEFORE ANY IMPORTS
 ******************************************************************/
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// If you need custom path (since you use config/config.env)
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: join(__dirname, 'config', 'config.env'),
});

/******************************************************************
 * Import app & DB AFTER env loads
 ******************************************************************/
import app from './app.js';
import connectDatabase from './config/database.js';

/******************************************************************
 * Debug ENV (optional)
 ******************************************************************/
console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
console.log("SECRET:", process.env.RAZORPAY_KEY_SECRET);

/******************************************************************
 * Handle Uncaught Exceptions
 ******************************************************************/
process.on('uncaughtException', err => {
  console.log(`ERROR: ${err.message}`);
  console.log('Shutting down server due to uncaught exception');
  process.exit(1);
});

/******************************************************************
 * Connect Database
 ******************************************************************/
connectDatabase();

/******************************************************************
 * Start Server
 ******************************************************************/
const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

/******************************************************************
 * Handle Unhandled Promise Rejections
 ******************************************************************/
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${err.message}`);
  console.log(
    'Shutting down the server due to Unhandled Promise Rejection'
  );
  server.close(() => {
    process.exit(1);
  });
});