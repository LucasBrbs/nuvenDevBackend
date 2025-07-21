const request = require('supertest');
const express = require('express');
const datasetsRouter = require('../../routes/datasets');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => next());

const mockUpload = jest.fn((req, res) => res.status(201).json({ id: 1, nome: 'mock' }));
const mockListDatasets = jest.fn((req, res) => res.json([{ id: 1, nome: 'mock' }]));
const mockListRecordsByDataset = jest.fn((req, res) => res.json([{ id: 1, dataset_id: 1 }]));
const mockSearchRecords = jest.fn((req, res) => res.json([{ id: 1, texto: 'mock' }]));
const mockDeleteDataset = jest.fn((req, res) => res.json({ message: 'Dataset apagado com sucesso.' }));

jest.mock('../../controllers/datasetControllers', () => ({
  upload: (req, res) => mockUpload(req, res),
  listDatasets: (req, res) => mockListDatasets(req, res),
  listRecordsByDataset: (req, res) => mockListRecordsByDataset(req, res),
  searchRecords: (req, res) => mockSearchRecords(req, res),
  deleteDataset: (req, res) => mockDeleteDataset(req, res)
}));

const app = express();
app.use(express.json());
app.use('/datasets', datasetsRouter);

describe('POST /datasets/upload', () => {
  it('deve fazer upload mockado', async () => {
    const response = await request(app)
      .post('/datasets/upload')
      .attach('file', Buffer.from('mock'), 'mock.csv');
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockUpload).toHaveBeenCalled();
  });
});

describe('GET /datasets', () => {
  it('deve retornar datasets mockados', async () => {
    const response = await request(app).get('/datasets');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(mockListDatasets).toHaveBeenCalled();
  });
});

describe('GET /datasets/:id/records', () => {
  it('deve retornar registros mockados', async () => {
    const response = await request(app).get('/datasets/1/records');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(mockListRecordsByDataset).toHaveBeenCalled();
  });
});

describe('GET /datasets/search', () => {
  it('deve retornar registros encontrados', async () => {
    const response = await request(app).get('/datasets/search?query=teste');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(mockSearchRecords).toHaveBeenCalled();
  });
});

describe('DELETE /datasets/:id', () => {
  it('deve apagar dataset mockado', async () => {
    const response = await request(app).delete('/datasets/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Dataset apagado com sucesso.');
    expect(mockDeleteDataset).toHaveBeenCalled();
  });
});