FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

EXPOSE 3000

# Script para executar migrações e iniciar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]