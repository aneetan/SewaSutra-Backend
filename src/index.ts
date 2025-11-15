import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import authRouter from './routes/auth.routes';
import companyRouter from './routes/company.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/company', companyRouter);


app.get('/', async(req: Request, res: Response) => {
   res.json({ message: 'Hello from AidLink' });
});

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))  
 