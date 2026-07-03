import mongoose from 'mongoose';

/**
 * Connect to MongoDB. The connection string is read from MONGO_URI.
 * Works with both a local mongod and MongoDB Atlas.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('✖  MONGO_URI is not defined in your environment (.env).');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✔  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`✖  MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠  MongoDB disconnected.');
  });
};

export default connectDB;
