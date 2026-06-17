/**
 * Punto de entrada del servidor
 * Arranca Express y establece conexión con la base de datos
 */

require('dotenv').config();

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');
const { verifyMailConnection } = require('./config/mailer');

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos (con reintentos para Neon free tier)
    await prisma.connectWithRetry();

    // Verificar conexión al servidor de correo (solo en desarrollo)
    if (env.isDev) {
      await verifyMailConnection();
    }

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor COTATUR corriendo en el puerto ${PORT}`);
      console.log(`📌 Entorno: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Cierre gracioso ante señales del sistema
process.on('SIGINT', async () => {
  console.log('\n🔴 Apagando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
