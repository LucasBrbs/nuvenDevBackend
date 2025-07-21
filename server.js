const express = require('express');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth'); 
const datasetsRoutes = require('./routes/datasets');
const recordsRoutes = require('./routes/records');
const queriesRoutes = require('./routes/queries');


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Rotas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', authRoutes);
app.use('/datasets', datasetsRoutes);
app.use('/records', recordsRoutes);
app.use('/queries', queriesRoutes);

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}
module.exports = app;