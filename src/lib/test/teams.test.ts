import { describe, expect, it,} from '@jest/globals'
import request from 'supertest'
import {app} from '../../app.js'
import { Server } from 'http';

let server: Server;

beforeAll((done) => {
  const testPort = 5000; 
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


describe('Teams API', () => {

    it('should return all teams', async () => {
        const response = await request(app).get('/teams');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
      });

      it('should create a new team', async () => {
        const newTeam = {
          name: 'Test Team',
          description: 'Testing 123 123',
        };
        const response = await request(app).post('/teams').send(newTeam);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
      });

      it('should delete a specific team', async () => {
        const slug = 'test-team';
        const response = await request(app).delete(`/teams/${slug}`);
        expect(response.statusCode).toBe(204);
      });
 
});