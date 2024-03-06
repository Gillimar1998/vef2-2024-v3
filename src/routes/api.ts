import express from 'express';

export const router = express.Router();



export async function error() {
  throw new Error('error');
}


// Mun crasha öllu
router.get('/error', error);
