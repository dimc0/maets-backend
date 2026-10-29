import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectMongo() {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000, 
    maxPoolSize: 10,
  });
  console.log(`MongoDB OK (${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name})`);
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}
