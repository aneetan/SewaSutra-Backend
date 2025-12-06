import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import authRouter from './routes/auth.routes';
import companyRouter from './routes/company.routes';
import requirementRouter from './routes/requirement.route';
import { findMatches, runDemo, setupExamples } from './example/match.example';
import pineconeService from './services/pinecone.services';
import similarityRouter from './routes/similarity.route';
import notificationRouter from './routes/notification.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

pineconeService.initialize();

app.use('/auth', authRouter);
app.use('/company', companyRouter);
app.use('/client/requirement', requirementRouter);
app.use('/client', similarityRouter);
app.use('/notification', notificationRouter);



app.get('/', async(req: Request, res: Response) => {
   res.json({ message: 'Hello from ProLink' });
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))  
 