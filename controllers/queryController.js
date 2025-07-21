const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { InferenceClient } = require("@huggingface/inference");
const client = new InferenceClient(process.env.HF_TOKEN);

exports.createQuery = async (req, res) => {
  try {
    const { pergunta, datasetId } = req.body;
    const usuario_id = req.userId;

    if (!pergunta || !datasetId) {
      return res.status(400).json({ error: "Pergunta e datasetId são obrigatórios." });
    }


    const record = await prisma.records.findFirst({
      where: { dataset_id: datasetId },
    });
    if (!record) return res.status(404).json({ error: "Arquivo não encontrado." });

    const contexto = `Título: ${record.dados_json.nome}\n\nConteúdo:\n${record.dados_json.texto}`;

    
    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      model: "moonshotai/Kimi-K2-Instruct",
      messages: [
        {
          role: "user",
          content: `Pergunta: ${pergunta}\n\n${contexto}`,
        },
      ],
    });

    const resposta = chatCompletion.choices[0].message.content;

    
    const query = await prisma.queries.create({
      data: {
        pergunta,
        resposta,
        usuario_id,
        dataset_id: datasetId,
        criado_em: new Date(),
      },
    });

    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQueries = async (req, res) => {
  try {
    const queries = await prisma.queries.findMany({
      orderBy: { criado_em: 'desc' }
    });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar histórico de consultas.' });
  }
};