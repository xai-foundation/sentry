import mongoose, { Aggregate, ObjectId, Query } from 'mongoose';
import { IModel } from '../types/IModel';

const MONGODB_URL: string = process.env["MONGODB_URL"] || "";

let cachedConnection: typeof mongoose;

const dbConnect = async (): Promise<typeof mongoose> => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (MONGODB_URL == "") {
    throw new Error(
      'Please define the MONGODB_URL environment variable inside .env.local'
    )
  }

  const mongooseConnectionOptions = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000
  }
  mongoose.set('strictQuery', false);
  try {
    cachedConnection = await mongoose.connect(MONGODB_URL, mongooseConnectionOptions);
  } catch (ex) {
    throw "Failed to connect MongoDB";
  }

  return cachedConnection;
}

export const executeQuery = async (query: Query<any, any> | Aggregate<any[]>, catchError: boolean = false): Promise<IModel | IModel[] | ObjectId | number | null> => {
  try {
    await dbConnect();
    const data = await query.exec();
    return data;
  } catch (ex) {
    const error = `Error executing db query`;

    if (catchError) {
      return null;
    }
    throw error;
  }
}

export const disconnect = (): Promise<any> => {
  if (cachedConnection) { return mongoose.disconnect(); }
  return Promise.resolve();
}

export default dbConnect