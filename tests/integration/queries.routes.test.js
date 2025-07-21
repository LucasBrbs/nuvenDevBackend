const request = require('supertest');
const express = require('express');
const queriesRouter = require('../../routes/queries');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => next());

const mockCreateQuery = jest.fn((req, res) => res.status(201).json({ id: 1, pergunta: 'mock', datasetId: 1 }));
const mockGetQueries = jest.fn((req, res) => res.json([{ id: 1, pergunta: 'mock', resposta: 'resposta', datasetId: 1, createdAt: new Date().toISOString() }]));
jest.mock('../../controllers/queryController', () => ({
  createQuery: (req, res) => mockCreateQuery(req, res),
  getQueries: (req, res) => mockGetQueries(req, res)
}));

const app = express();
app.use(express.json());
app.use('/queries', queriesRouter);

describe('POST /queries', () => {
  it('deve criar uma query mockada', async () => {
    const response = await request(app)
      .post('/queries')
      .send({ pergunta: 'mock', datasetId: 1 });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockCreateQuery).toHaveBeenCalled();
  });
});

describe('GET /queries', () => {
  it('deve retornar queries mockadas', async () => {
    const response = await request(app).get('/queries');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(mockGetQueries).toHaveBeenCalled();
  });
});