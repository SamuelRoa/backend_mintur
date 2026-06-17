/**
 * Helper de paginación para queries de Prisma
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Calcula skip y take para Prisma a partir de query params
 * @param {object} query - req.query del endpoint
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const getPaginationParams = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
};

/**
 * Construye el objeto meta para incluir en la respuesta paginada
 * @param {number} total - Total de registros en la BD
 * @param {number} page - Página actual
 * @param {number} limit - Registros por página
 * @returns {object} meta
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { getPaginationParams, buildPaginationMeta };
