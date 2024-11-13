import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routers';
const mongoDb = process.env.MONGO_URI || "mongodb://localhost:27017/marketplace"
const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => { res.send('ok') })
app.use('/', router);

console.log('MongoDB URI:', mongoDb);
// Connect to MongoDB
mongoose
    .connect(mongoDb)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});