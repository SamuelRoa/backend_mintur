const { z } = require('zod');

const siteSchema = z.object({
  clave: z.string().trim().min(1, 'Clave requerida').max(80),
  valor: z.string().max(5000).nullish(),
  descripcion: z.string().trim().max(255).nullish(),
});

const regionCmsSchema = z.object({
  regionId: z.coerce.number().int().min(1, 'Región inválida'),
  tagline: z.string().trim().max(200).nullish(),
  descripcion: z.string().max(5000).nullish(),
  historia: z.string().max(10000).nullish(),
  costumbres: z.string().max(10000).nullish(),
  clima: z.string().trim().max(500).nullish(),
  imagenUrl: z.string().trim().max(500).nullish(),
  color: z.string().trim().max(20).nullish(),
});

module.exports = { siteSchema, regionCmsSchema };
