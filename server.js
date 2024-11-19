import express from 'express';
import dotenv from "dotenv"
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import cors from 'cors'

dotenv.config({
     path: ".env"
});

const dbURI = process.env.MONGO_URI

connectDB(dbURI);

const app = express();
app.use(express.json());

app.use(cors({}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.use(errorMiddleware)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
