const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const queryController = require('../controllers/queryController');

/**
 * @swagger
 * /queries:
 *   post:
 *     summary: Registra uma busca simulada com Mock IA.
 *     tags: [Queries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pergunta:
 *                 type: string
 *               datasetId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Registro criado com sucesso.
 *       400:
 *         description: Dados obrigatórios não informados.
 */
router.post('/', authMiddleware, queryController.createQuery);


/**
 * @swagger
 * /queries:
 *   get:
 *     summary: Lista o histórico de perguntas e respostas realizadas pela IA.
 *     description: Retorna todas as consultas já feitas, incluindo a pergunta do usuário, a resposta gerada pela IA, o dataset relacionado e a data/hora da consulta.
 *     tags: [Queries]
 *     responses:
 *       200:
 *         description: Lista de consultas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   pergunta:
 *                     type: string
 *                   resposta:
 *                     type: string
 *                   datasetId:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', queryController.getQueries);

module.exports = router;