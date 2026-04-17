import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import searchRoute from './routes/search.js';
import identifyRoute from './routes/identify.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/search', searchRoute);
app.use('/identify', identifyRoute);

app.listen(PORT, () => console.log(`Pokedex backend running on port ${PORT}`));
