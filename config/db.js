import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = (uri) => {
  mongoose
      .connect(uri, { dbName: "aaaminer" })
      .then((data) => logger.success(`Connected to DB: ${data.connection.host}`))
      .catch((err) => {
          throw err
      })
}

export default connectDB;
