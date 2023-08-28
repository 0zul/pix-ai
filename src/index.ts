import dotenv from 'dotenv';
dotenv.config();
import express, { Express } from 'express';
import { connectDatabase } from './lib/db';
import apiRoutes from './routes/apiRoutes';

const app: Express = express();
const port = process.env.PORT || 3000;

connectDatabase();

app.use(express.json());

// Use the routes defined in apiRoutes.ts
app.use('/v1', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
