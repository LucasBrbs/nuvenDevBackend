jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();
  const mockFindUnique = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      users: {
        create: mockCreate,
        findUnique: mockFindUnique
      }
    })),
    __mocks: { mockCreate, mockFindUnique }
  };
});

const { PrismaClient, __mocks } = require('@prisma/client');
const prisma = new PrismaClient();
const mockCreate = __mocks.mockCreate;
const mockFindUnique = __mocks.mockFindUnique;

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const authController = require('../../controllers/authController');

beforeEach(() => {
  mockCreate.mockReset();
  mockFindUnique.mockReset();
  bcrypt.hash.mockReset();
  bcrypt.compare.mockReset();
  jwt.sign.mockReset();
});

describe('authController.register', () => {
  it('deve registrar um novo usuário', async () => {
    bcrypt.hash.mockResolvedValue('hash');
    mockCreate.mockResolvedValue({ id: 1, nome: 'Teste', email: 'teste@exemplo.com' });

    const req = { body: { nome: 'Teste', email: 'teste@exemplo.com', senha: '123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
    expect(mockCreate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, nome: 'Teste', email: 'teste@exemplo.com' });
  });

  it('deve retornar erro se der exceção', async () => {
    bcrypt.hash.mockRejectedValueOnce(new Error('Erro'));
    const req = { body: { nome: 'Teste', email: 'teste@exemplo.com', senha: '123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro' });
  });
});

describe('authController.login', () => {
  it('deve retornar token se login for válido', async () => {
    const user = { id: 1, email: 'teste@exemplo.com', senha_hash: 'hash' };
    mockFindUnique.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');

    const req = { body: { email: 'teste@exemplo.com', senha: '123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.login(req, res);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'teste@exemplo.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('123', 'hash');
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ token: 'token' });
  });

  it('deve retornar 401 se usuário não existir', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { body: { email: 'nao@exemplo.com', senha: '123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });

  it('deve retornar 401 se senha for inválida', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, email: 'teste@exemplo.com', senha_hash: 'hash' });
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email: 'teste@exemplo.com', senha: 'errada' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });

  it('deve retornar erro se der exceção', async () => {
    mockFindUnique.mockRejectedValueOnce(new Error('Erro'));
    const req = { body: { email: 'teste@exemplo.com', senha: '123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro' });
  });
});

describe('authController.me', () => {
  it('deve retornar dados do usuário autenticado', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, nome: 'Teste', email: 'teste@exemplo.com' });

    const req = { userId: 1 };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.me(req, res);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.json).toHaveBeenCalledWith({ id: 1, nome: 'Teste', email: 'teste@exemplo.com' });
  });

  it('deve retornar 404 se usuário não for encontrado', async () => {
    mockFindUnique.mockResolvedValue(null);

    const req = { userId: 999 };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await authController.me(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
  });
});