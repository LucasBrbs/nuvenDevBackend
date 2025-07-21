const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const senha_hash = await bcrypt.hash(senha, 10);
    const user = await prisma.users.create({
      data: { nome, email, senha_hash }
    });
    res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  const userId = req.userId;
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ id: user.id, nome: user.nome, email: user.email });
};