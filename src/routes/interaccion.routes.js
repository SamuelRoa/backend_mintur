const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN, ROLE_GESTOR } = require('../middleware/role.middleware');
const { getEventos, getEventoById, createEvento, updateEvento, deleteEvento } = require('../controllers/eventos.controller');
const { getOpiniones, createOpinion, deleteOpinion } = require('../controllers/opiniones.controller');
const { getConsultas, getConsultaById, createConsulta, responderConsulta } = require('../controllers/consultas.controller');
const {
  getContenidoInstitucional, createContenidoInstitucional,
  updateContenidoInstitucional, deleteContenidoInstitucional,
  getContenidoTuristico, createContenidoTuristico,
  updateContenidoTuristico, deleteContenidoTuristico,
} = require('../controllers/contenido.controller');

const { validate } = require('../middleware/zod.middleware');
const {
  eventoSchema, opinionSchema, consultaSchema, responderConsultaSchema, contenidoSchema,
} = require('../schemas/entidades.schema');

const router = Router();

const adminOGestor = requireRole(ROLE_ADMIN, ROLE_GESTOR);

// --- Eventos ---
router.get('/eventos', getEventos);
router.get('/eventos/:id', getEventoById);
router.post('/eventos', authenticate, adminOGestor, validate(eventoSchema), createEvento);
router.put('/eventos/:id', authenticate, adminOGestor, validate(eventoSchema.partial()), updateEvento);
router.delete('/eventos/:id', authenticate, adminOGestor, deleteEvento);

// --- Opiniones ---
router.get('/opiniones', getOpiniones);
router.post('/opiniones', authenticate, validate(opinionSchema), createOpinion);
router.delete('/opiniones/:id', authenticate, adminOGestor, deleteOpinion);

// --- Consultas ---
router.get('/consultas', authenticate, adminOGestor, getConsultas);
router.get('/consultas/:id', authenticate, adminOGestor, getConsultaById);
router.post('/consultas', validate(consultaSchema), createConsulta); // Público
router.put('/consultas/:id/responder', authenticate, adminOGestor, validate(responderConsultaSchema), responderConsulta);

// --- CMS Institucional ---
router.get('/contenido/institucional', getContenidoInstitucional);
router.post('/contenido/institucional', authenticate, adminOGestor, validate(contenidoSchema), createContenidoInstitucional);
router.put('/contenido/institucional/:id', authenticate, adminOGestor, validate(contenidoSchema.partial()), updateContenidoInstitucional);
router.delete('/contenido/institucional/:id', authenticate, adminOGestor, deleteContenidoInstitucional);

// --- CMS Turístico ---
router.get('/contenido/turistico', getContenidoTuristico);
router.post('/contenido/turistico', authenticate, adminOGestor, validate(contenidoSchema), createContenidoTuristico);
router.put('/contenido/turistico/:id', authenticate, adminOGestor, validate(contenidoSchema.partial()), updateContenidoTuristico);
router.delete('/contenido/turistico/:id', authenticate, adminOGestor, deleteContenidoTuristico);

module.exports = router;
