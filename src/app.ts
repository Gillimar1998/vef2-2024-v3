import dotenv from 'dotenv';
import express from 'express';
import { router } from './routes/api.js';
import { apiRouter } from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/', apiRouter);
app.use(router);

function errorHandler(err: Error){

  console.error('Villa!!', err);

}

app.use(errorHandler);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
