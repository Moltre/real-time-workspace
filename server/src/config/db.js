'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`❌  MongoDB connection failed: ${err.message}`);
    // Do not exit – allow the server to run without DB in dev (health-check still works)
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

module.exports = connectDB;
