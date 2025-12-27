import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import authRouter from './routes/auth.routes';
import companyRouter from './routes/company.routes';
import { findMatches, runDemo, setupExamples } from './example/match.example';
import pineconeService from './services/pinecone.services';
import notificationRouter from './routes/notification.route';
import clientRouter from './routes/client.route';
import PusherConfig from './config/pusher.config';
import chatRouter from './routes/chat.routes';
import contractRouter from './routes/contract.route';
import paymentRouter from './routes/payment.route';
import reviewRouter from './routes/review.route';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

pineconeService.initialize();

app.use('/auth', authRouter);
app.use('/company', companyRouter);
app.use('/client', clientRouter);
app.use('/notification', notificationRouter);
app.use('/chat', chatRouter);
app.use('/contract', contractRouter);
app.use('/payment', paymentRouter);
app.use('/review', reviewRouter);

app.get('/', async(req: Request, res: Response) => {
   res.json({ message: 'Hello from ProLink' });
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))  
 