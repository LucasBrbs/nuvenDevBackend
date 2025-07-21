const request = require('supertest');
const express = require('express');
const recordsRouter = require('../../routes/records');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => next());

const mockSearchRecords = jest.fn((req, res) => res.json([{ id: 1, texto: 'mock' }]));
jest.mock('../../controllers/datasetControllers', () => ({
  searchRecords: (req, res) => mockSearchRecords(req, res)
}));

const app = express();
app.use(express.json());
app.use('/records', recordsRouter);

describe('GET /records/search', () => {
  it('deve retornar registros mockados', async () => {
    const response = await request(app).get('/records/search?query=teste');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, texto: 'mock' }]);
    expect(mockSearchRecords).toHaveBeenCalled();
  });
});