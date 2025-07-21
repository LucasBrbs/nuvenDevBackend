const request = require('supertest');
const express = require('express');
const authRouter = require('../../routes/auth');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.userId = 1; 
  next();
});

const mockRegister = jest.fn((req, res) => res.status(201).json({ id: 1, nome: 'mock', email: 'mock@mock.com' }));
const mockLogin = jest.fn((req, res) => res.json({ token: 'mocktoken' }));
const mockMe = jest.fn((req, res) => res.json({ id: 1, nome: 'mock', email: 'mock@mock.com' }));

jest.mock('../../controllers/authController', () => ({
  register: (req, res) => mockRegister(req, res),
  login: (req, res) => mockLogin(req, res),
  me: (req, res) => mockMe(req, res)
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('POST /auth/register', () => {
  it('deve registrar um usuário mockado', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ nome: 'mock', email: 'mock@mock.com', senha: '123' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockRegister).toHaveBeenCalled();
  });
});

describe('POST /auth/login', () => {
  it('deve retornar token mockado', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'mock@mock.com', senha: '123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token', 'mocktoken');
    expect(mockLogin).toHaveBeenCalled();
  });
});

describe('GET /auth/me', () => {
  it('deve retornar dados do usuário mockado', async () => {
    const response = await request(app).get('/auth/me');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockMe).toHaveBeenCalled();
  });
});