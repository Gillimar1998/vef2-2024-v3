import dotenv from 'dotenv';
import express, { NextFunction, Request, Response, } from 'express';
import { router, bye, hello, error } from './routes/api.js';
import { apiRouter } from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/', apiRouter);
app.use(router);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction){

  console.error('Villa!!', err);

}

app.use(errorHandler);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
