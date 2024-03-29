import dotenv from 'dotenv';
import express from 'express';
import { apiRouter } from './routes/index.js';
import { cors } from './lib/cors.js';

dotenv.config();

export const app = express();

app.use(express.json());

app.use(cors);

app.use('/', apiRouter);


function errorHandler(err: Error){

  console.error('Villa!!', err);

}

app.use(errorHandler);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
