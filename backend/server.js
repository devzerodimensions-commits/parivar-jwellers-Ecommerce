import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✔  Jewelly API running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
};

start();

// Fail loud on unhandled async errors instead of dying silently.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
