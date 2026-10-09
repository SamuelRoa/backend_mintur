/**
 * Punto de entrada del servidor
 * Arranca Express y establece conexión con la base de datos
 */

require('dotenv').config();

const http = require('http');
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');
const { verifyMailConnection } = require('./config/mailer');
const { initSocket } = require('./services/socket');

const PORT = env.PORT;

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos (con reintentos para Neon free tier)
    await prisma.connectWithRetry();

    // Verificar conexión al servidor de correo (solo en desarrollo)
    if (env.isDev) {
      await verifyMailConnection();
    }

    // Iniciar servidor HTTP con Socket.io
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor COTATUR corriendo en el puerto ${PORT}`);
      console.log(`📌 Entorno: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket habilitado para notificaciones en tiempo real`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.error('   → Verifica DATABASE_URL/DIRECT_URL en .env y que el proyecto Neon esté activo (no pausado/eliminado).');
    console.error('   → Neon free tier se suspende por inactividad: entra al dashboard Neon y reactiva la rama.');
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
