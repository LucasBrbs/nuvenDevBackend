const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');
const datasetController = require('../controllers/datasetControllers');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // limite de 10MB por arquivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .csv e .pdf são permitidos'));
    }
  },
});

/**
 * @swagger
 * /datasets/upload:
 *   post:
 *     summary: Faz upload de um arquivo (.csv ou .pdf) e registra metadados.
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Upload realizado com sucesso.
 *       400:
 *         description: Erro no upload.
 *       401:
 *         description: Não autorizado.
 */
router.post('/upload', authMiddleware, upload.single('file'), datasetController.upload);

/**
 * @swagger
 * /datasets:
 *   get:
 *     summary: Lista todos os datasets do usuário autenticado.
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de datasets retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 */
router.get('/', authMiddleware, datasetController.listDatasets);

/**
 * @swagger
 * /datasets/{id}/records:
 *   get:
 *     summary: Lista todos os registros de um dataset específico.
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do dataset
 *     responses:
 *       200:
 *         description: Lista de registros retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Dataset não encontrado.
 */
router.get('/:id/records', authMiddleware, datasetController.listRecordsByDataset);

/**
 * @swagger
 * /datasets/search:
 *   get:
 *     summary: Busca registros por palavra-chave no campo JSON dos records.
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Palavra-chave para busca nos registros
 *     responses:
 *       200:
 *         description: Registros encontrados com sucesso.
 *       400:
 *         description: Query não informada.
 */
router.get('/search', authMiddleware, datasetController.searchRecords);


/**
 * @swagger
 * /datasets/{id}:
 *   delete:
 *     summary: Remove um dataset e todos os registros associados.
 *     tags: [Datasets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do dataset a ser removido
 *     responses:
 *       200:
 *         description: Dataset apagado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deleted:
 *                   type: object
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Dataset não encontrado.
 *       500:
 *         description: Erro ao apagar dataset.
 */
router.delete('/:id', authMiddleware, datasetController.deleteDataset);

module.exports = router;