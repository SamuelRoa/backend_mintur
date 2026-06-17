/**
 * Servicio de correo electrónico
 * Maneja el envío de distintos tipos de correos del sistema
 */

const { transporter } = require('../config/mailer');
const env = require('../config/env');

/**
 * Envía un correo genérico
 * @param {object} options
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Cuerpo HTML
 * @param {string} [options.text] - Cuerpo texto plano (fallback)
 */
const sendMail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]*>/g, ''),
  });
  return info;
};

/**
 * Correo de bienvenida al registrar un nuevo usuario
 */
const sendWelcomeEmail = async (user) => {
  return sendMail({
    to: user.email,
    subject: 'Bienvenido a la Plataforma Turística COTATUR',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5276;">Bienvenido, ${user.nombre}</h1>
        <p>Tu cuenta ha sido creada exitosamente en la Plataforma Turística COTATUR.</p>
        <p>Ya puedes iniciar sesión con tu correo electrónico registrado.</p>
        <hr style="border-color: #eee;" />
        <p style="color: #777; font-size: 12px;">
          Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  });
};

/**
 * Correo de respuesta a una consulta ciudadana
 */
const sendConsultaResponse = async ({ destinatario, consulta, respuesta }) => {
  return sendMail({
    to: destinatario,
    subject: 'Respuesta a tu consulta — COTATUR',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a5276;">Respuesta a tu Consulta</h2>
        <p><strong>Tu consulta:</strong></p>
        <blockquote style="border-left: 4px solid #1a5276; padding-left: 12px; color: #555;">
          ${consulta}
        </blockquote>
        <p><strong>Respuesta:</strong></p>
        <p>${respuesta}</p>
        <hr style="border-color: #eee;" />
        <p style="color: #777; font-size: 12px;">Plataforma Turística COTATUR</p>
      </div>
    `,
  });
};

/**
 * Notificación de cambio de estado de un prestador de servicios
 */
const sendEstadoPrestadorEmail = async ({ email, nombre, estado }) => {
  const estadoTexto = estado === 'validado' ? 'aprobado' : 'rechazado';
  const color = estado === 'validado' ? '#27ae60' : '#c0392b';

  return sendMail({
    to: email,
    subject: `Tu registro como prestador de servicios ha sido ${estadoTexto}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">Registro ${estadoTexto}</h2>
        <p>Estimado/a <strong>${nombre}</strong>,</p>
        <p>Tu registro como prestador de servicios turísticos ha sido <strong style="color: ${color};">${estadoTexto}</strong>.</p>
        <hr style="border-color: #eee;" />
        <p style="color: #777; font-size: 12px;">Plataforma Turística COTATUR</p>
      </div>
    `,
  });
};

/**
 * Correo para restablecimiento de contraseña
 */
const sendPasswordResetEmail = async ({ email, nombre, resetUrl }) => {
  return sendMail({
    to: email,
    subject: 'Restablece tu contraseña — COTATUR',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a5276;">Hola, ${nombre}</h1>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en la Plataforma Turística COTATUR.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}"
             style="background-color: #1a5276; color: white; padding: 12px 32px;
                    border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <hr style="border-color: #eee;" />
        <p style="color: #777; font-size: 12px;">Plataforma Turística COTATUR</p>
      </div>
    `,
  });
};

module.exports = { sendMail, sendWelcomeEmail, sendConsultaResponse, sendEstadoPrestadorEmail, sendPasswordResetEmail };
