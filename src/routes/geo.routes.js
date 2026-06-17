const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getPaises, getRegiones, getCorporaciones, getEstados,
  getMunicipios, getParroquias, getTiposTurismo, getTiposEvento,
} = require('../controllers/geo.controller');

const router = Router();

// Todos los catálogos geográficos son públicos
router.get('/paises', getPaises);
router.get('/regiones', getRegiones);
router.get('/corporaciones', getCorporaciones);
router.get('/estados', getEstados);
router.get('/municipios', getMunicipios);
router.get('/parroquias', getParroquias);
router.get('/tipos-turismo', getTiposTurismo);
router.get('/tipos-evento', getTiposEvento);

module.exports = router;
