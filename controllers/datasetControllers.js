const fs = require('fs');
const path = require('path');
const supabase = require('../services/supabase');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const pdfParse = require('pdf-parse');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

    const { originalname, buffer, mimetype, size } = req.file;
    const usuario_id = req.userId;
    const bucket = 'datasets';

    
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const filename = `${Date.now()}_${originalname}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) return res.status(500).json({ error: error.message });

    
    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;

    
    const dataset = await prisma.datasets.create({
      data: {
        nome: originalname,
        usuario_id,
        criado_em: new Date(),
      },
    });

    
    let textoExtraido = null;
    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      textoExtraido = pdfData.text;
    } else if (mimetype === 'text/csv') {
      textoExtraido = buffer.toString('utf-8');
    }

    
    await prisma.records.create({
      data: {
        dataset_id: dataset.id,
        dados_json: {
          nome: originalname,
          tamanho: size,
          mimetype,
          data: new Date(),
          usuario_id,
          localPath: filePath,
          supabaseUrl: fileUrl,
          texto: textoExtraido, 
        },
        criado_em: new Date(),
      },
    });

    res.status(201).json({
      message: 'Upload realizado com sucesso',
      localPath: filePath,
      supabaseUrl: fileUrl,
      datasetId: dataset.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.listDatasets = async (req, res) => {
  try {
    const usuario_id = req.userId;
    const datasets = await prisma.datasets.findMany({
      where: { usuario_id },
      orderBy: { criado_em: 'desc' },
    });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.listRecordsByDataset = async (req, res) => {
  try {
    const dataset_id = parseInt(req.params.id, 10);
    const records = await prisma.records.findMany({
      where: { dataset_id },
      orderBy: { criado_em: 'desc' },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.searchRecords = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query não informada' });

    
    const records = await prisma.records.findMany({
      where: {
        OR: [
          { dados_json: { path: ['nome'], string_contains: query } },
          { dados_json: { path: ['texto'], string_contains: query } },
        ],
      },
      orderBy: { criado_em: 'desc' },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.records.deleteMany({ where: { dataset_id: Number(id) } });
    
    await prisma.datasets.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Dataset apagado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar dataset.' });
  }
};