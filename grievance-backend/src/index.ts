import express, { type Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'; 

const app: Application = express();

app.use(cors());
app.use(express.json());


app.use('/api', authRoutes);

app.get('/api/ping', (req, res) => res.send('API is alive'));


export default app;