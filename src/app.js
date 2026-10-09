/**
 * Configuración de Express — app.js
 * Define middlewares globales y registra todas las rutas de la API
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { errorHandler } = require('./middleware/error.middleware');

// Importar routers
const authRoutes = require('./routes/auth.routes');
const destinosRoutes = require('./routes/destinos.routes');
const rutasRoutes = require('./routes/rutas.routes');
const prestadoresRoutes = require('./routes/prestadores.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const geoRoutes = require('./routes/geo.routes');
const interaccionRoutes = require('./routes/interaccion.routes');
const cmsRoutes = require('./routes/cms.routes');

const app = express();

// =============================================
// MIDDLEWARES GLOBALES
// =============================================

// Seguridad HTTP headers
app.use(helmet());

// CORS — permitir orígenes configurados en .env
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (Postman, curl, tests)
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origen no permitido — ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Logger de peticiones HTTP
app.use(morgan(env.isDev ? 'dev' : 'combined'));

// Parser JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API COTATUR funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// =============================================
// RUTAS DE LA API
// =============================================
const API = '/api';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/destinos`, destinosRoutes);
app.use(`${API}/rutas`, rutasRoutes);
app.use(`${API}/prestadores`, prestadoresRoutes);
app.use(`${API}/usuarios`, usuariosRoutes);
app.use(`${API}/geo`, geoRoutes);
app.use(API, interaccionRoutes);
app.use(API, cmsRoutes);

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// =============================================
// MANEJADOR CENTRALIZADO DE ERRORES
// =============================================
app.use(errorHandler);

module.exports = app;
