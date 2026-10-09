const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole, ROLE_ADMIN, ROLE_GESTOR } = require('../middleware/role.middleware');
const { validate } = require('../middleware/zod.middleware');
const { siteSchema, regionCmsSchema } = require('../schemas/cms.schema');
const {
  getSite, upsertSite, getRegionesCms, getRegionCmsById, upsertRegionCms,
} = require('../controllers/site.controller');

const router = Router();
const adminOGestor = requireRole(ROLE_ADMIN, ROLE_GESTOR);

router.get('/site', getSite);
router.put('/site', authenticate, adminOGestor, validate(siteSchema), upsertSite);

router.get('/regiones-cms', getRegionesCms);
router.get('/regiones-cms/:id', getRegionCmsById);
router.put('/regiones-cms', authenticate, adminOGestor, validate(regionCmsSchema), upsertRegionCms);

module.exports = router;
