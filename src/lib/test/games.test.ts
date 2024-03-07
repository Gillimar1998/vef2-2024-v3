import { describe, expect, it, } from '@jest/globals'
import request from 'supertest'
import {app} from '../../app.js'
import { Server } from 'http';

let server: Server;

beforeAll((done) => {
  const testPort = 4000; 
  server = app.listen(testPort, () => {
    console.log(`Test server running on port ${testPort}`);
    done();
  });
});

afterAll((done) => {
  server.close(() => {
    console.log('Test server stopped');
    done();
  });
});


describe('Games API', () => {

    it('should return all games', async () => {
        const response = await request(app).get('/games');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });


      it('should delete a specific game', async () => {
        const gameId = '12';
        const response = await request(app).delete(`/games/${gameId}`);
        expect(response.statusCode).toBe(204);
      });
 
});