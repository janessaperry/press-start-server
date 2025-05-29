import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const { SERVER_PORT, CORS_ORIGIN } = process.env;


app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Press Start API!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


const port = SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

