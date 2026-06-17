/**
 * Servicio de archivos
 * Gestiona la generación y descarga de reportes y archivos exportables
 */

const { Parser } = require('json2csv');

/**
 * Genera un buffer CSV a partir de un array de objetos
 * @param {Array<object>} data - Array de registros
 * @param {string[]} fields - Campos a incluir en el CSV
 * @returns {string} contenido CSV
 */
const generateCSV = (data, fields = null) => {
  const opts = fields ? { fields } : {};
  const parser = new Parser(opts);
  return parser.parse(data);
};

/**
 * Envía un archivo CSV como respuesta HTTP de descarga
 * @param {import('express').Response} res
 * @param {string} csvContent - Contenido CSV
 * @param {string} filename - Nombre del archivo (sin extensión)
 */
const sendCSVDownload = (res, csvContent, filename = 'reporte') => {
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}.csv"`,
  });
  // BOM para que Excel abra correctamente con caracteres especiales
  res.send('\uFEFF' + csvContent);
};

/**
 * Envía un archivo JSON como descarga
 */
const sendJSONDownload = (res, data, filename = 'exportacion') => {
  res.set({
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="${filename}.json"`,
  });
  res.json(data);
};

module.exports = { generateCSV, sendCSVDownload, sendJSONDownload };
