/**
 * Configuración del transporter de Nodemailer con Gmail
 */

const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

/**
 * Verifica la conexión con el servidor de correo
 * Se llama al iniciar el servidor en desarrollo
 */
const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Conexión con servidor de correo establecida');
  } catch (error) {
    console.warn('⚠️  No se pudo conectar al servidor de correo:', error.message);
  }
};

module.exports = { transporter, verifyMailConnection };
