const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const RETRY_DELAY = 2000;
const MAX_RETRIES = 5;

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['warn', 'error'] : ['error'],
  });

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}

const connectWithRetry = async (retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Conexión a la base de datos establecida');
      return;
    } catch (err) {
      console.warn(`⚠️  Intento ${attempt}/${retries} falló: ${err.message}`);
      if (attempt === retries) throw err;
      console.warn(`   Reintentando en ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

prisma.connectWithRetry = connectWithRetry;

module.exports = prisma;
