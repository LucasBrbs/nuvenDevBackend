jest.mock('@prisma/client', () => {
  const mockDatasetsCreate = jest.fn();
  const mockDatasetsFindMany = jest.fn();
  const mockDatasetsDelete = jest.fn();
  const mockRecordsCreate = jest.fn();
  const mockRecordsFindMany = jest.fn();
  const mockRecordsDeleteMany = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      datasets: {
        create: mockDatasetsCreate,
        findMany: mockDatasetsFindMany,
        delete: mockDatasetsDelete
      },
      records: {
        create: mockRecordsCreate,
        findMany: mockRecordsFindMany,
        deleteMany: mockRecordsDeleteMany
      }
    })),
    __mocks: {
      mockDatasetsCreate,
      mockDatasetsFindMany,
      mockDatasetsDelete,
      mockRecordsCreate,
      mockRecordsFindMany,
      mockRecordsDeleteMany
    }
  };
});

const { PrismaClient, __mocks } = require('@prisma/client');
const prisma = new PrismaClient();
const mockDatasetsCreate = __mocks.mockDatasetsCreate;
const mockDatasetsFindMany = __mocks.mockDatasetsFindMany;
const mockDatasetsDelete = __mocks.mockDatasetsDelete;
const mockRecordsCreate = __mocks.mockRecordsCreate;
const mockRecordsFindMany = __mocks.mockRecordsFindMany;
const mockRecordsDeleteMany = __mocks.mockRecordsDeleteMany;

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
jest.mock('fs');
jest.mock('path');
jest.mock('pdf-parse');
jest.mock('../../services/supabase', () => ({
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn()
  }
}));

const datasetController = require('../../controllers/datasetControllers');

beforeEach(() => {
  mockDatasetsCreate.mockReset();
  mockDatasetsFindMany.mockReset();
  mockDatasetsDelete.mockReset();
  mockRecordsCreate.mockReset();
  mockRecordsFindMany.mockReset();
  mockRecordsDeleteMany.mockReset();
  require('../../services/supabase').storage.upload.mockReset();
  pdfParse.mockReset && pdfParse.mockReset();
});

describe('datasetController.listDatasets', () => {
  it('deve retornar datasets do usuário', async () => {
    const datasets = [{ id: 1, nome: 'Dataset 1' }];
    mockDatasetsFindMany.mockResolvedValueOnce(datasets);

    const req = { userId: 1 };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.listDatasets(req, res);

    expect(mockDatasetsFindMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(datasets);
  });

  it('deve retornar erro se der exceção', async () => {
    mockDatasetsFindMany.mockRejectedValueOnce(new Error('Erro'));
    const req = { userId: 1 };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.listDatasets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro' });
  });
});

describe('datasetController.listRecordsByDataset', () => {
  it('deve retornar registros do dataset', async () => {
    const records = [{ id: 1, dataset_id: 1 }];
    mockRecordsFindMany.mockResolvedValueOnce(records);

    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.listRecordsByDataset(req, res);

    expect(mockRecordsFindMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(records);
  });
});

describe('datasetController.searchRecords', () => {
  it('deve retornar 400 se não passar query', async () => {
    const req = { query: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.searchRecords(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query não informada' });
  });

  it('deve retornar registros encontrados', async () => {
    const records = [{ id: 1 }];
    mockRecordsFindMany.mockResolvedValueOnce(records);

    const req = { query: { query: 'teste' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.searchRecords(req, res);

    expect(mockRecordsFindMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(records);
  });
});

describe('datasetController.deleteDataset', () => {
  it('deve apagar dataset e seus records', async () => {
    mockRecordsDeleteMany.mockResolvedValueOnce({});
    mockDatasetsDelete.mockResolvedValueOnce({});

    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.deleteDataset(req, res);

    expect(mockRecordsDeleteMany).toHaveBeenCalled();
    expect(mockDatasetsDelete).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Dataset apagado com sucesso.' });
  });

  it('deve retornar erro se der exceção', async () => {
    mockRecordsDeleteMany.mockRejectedValueOnce(new Error('Erro ao apagar'));
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await datasetController.deleteDataset(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao apagar dataset.' });
  });
});