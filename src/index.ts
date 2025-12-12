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

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

pineconeService.initialize();

app.use('/auth', authRouter);
app.use('/company', companyRouter);
app.use('/client', clientRouter);
app.use('/notification', notificationRouter);
let messages = [];

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const newMessage = { message, timestamp: new Date() };
  messages.push(newMessage);

  // Trigger Pusher event
  PusherConfig.trigger("chat-channel", "new-message", { message: newMessage.message });

  res.status(201).json(newMessage);
});

app.get('/', async(req: Request, res: Response) => {
   res.json({ message: 'Hello from ProLink' });
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))  
 