import { PrismaClient } from '@prisma/client';

// Configuração do banco de dados
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

// Instância global do Prisma Client
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

// Função para fechar a conexão
export async function closeDatabase() {
  await prisma.$disconnect();
} 