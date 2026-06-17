const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getEventos, getEventoById, createEvento, updateEvento, deleteEvento } = require('../controllers/eventos.controller');
const { getOpiniones, createOpinion, deleteOpinion } = require('../controllers/opiniones.controller');
const { getConsultas, getConsultaById, createConsulta, responderConsulta } = require('../controllers/consultas.controller');
const {
  getContenidoInstitucional, createContenidoInstitucional,
  updateContenidoInstitucional, deleteContenidoInstitucional,
  getContenidoTuristico, createContenidoTuristico,
  updateContenidoTuristico, deleteContenidoTuristico,
} = require('../controllers/contenido.controller');

const router = Router();

// --- Eventos ---
router.get('/eventos', getEventos);
router.get('/eventos/:id', getEventoById);
router.post('/eventos', authenticate, createEvento);
router.put('/eventos/:id', authenticate, updateEvento);
router.delete('/eventos/:id', authenticate, deleteEvento);

// --- Opiniones ---
router.get('/opiniones', getOpiniones);
router.post('/opiniones', authenticate, createOpinion);
router.delete('/opiniones/:id', authenticate, deleteOpinion);

// --- Consultas ---
router.get('/consultas', authenticate, getConsultas);
router.get('/consultas/:id', authenticate, getConsultaById);
router.post('/consultas', createConsulta); // Público
router.put('/consultas/:id/responder', authenticate, responderConsulta);

// --- CMS Institucional ---
router.get('/contenido/institucional', getContenidoInstitucional);
router.post('/contenido/institucional', authenticate, createContenidoInstitucional);
router.put('/contenido/institucional/:id', authenticate, updateContenidoInstitucional);
router.delete('/contenido/institucional/:id', authenticate, deleteContenidoInstitucional);

// --- CMS Turístico ---
router.get('/contenido/turistico', getContenidoTuristico);
router.post('/contenido/turistico', authenticate, createContenidoTuristico);
router.put('/contenido/turistico/:id', authenticate, updateContenidoTuristico);
router.delete('/contenido/turistico/:id', authenticate, deleteContenidoTuristico);

module.exports = router;
