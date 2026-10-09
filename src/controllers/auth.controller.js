/**
 * Controlador de Autenticación
 * Login, refresh de token y perfil del usuario autenticado
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const env = require('../config/env');
const { generateTokenPair, verifyRefreshToken, generateResetToken, verifyResetToken } = require('../services/token.service');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/mail.service');
const { success, created, error, unauthorized, notFound } = require('../utils/response.util');

/**
 * POST /api/auth/login
 * Autentica un usuario y devuelve access + refresh tokens
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.tM_USUAR.findUnique({
      where: { USUAR_EM: email },
      include: { TM_ROLES: true },
    });

    if (!user) {
      return unauthorized(res, 'Credenciales inválidas');
    }

    if (!user.USUAR_AC) {
      return unauthorized(res, 'Tu cuenta está desactivada. Contacta al administrador.');
    }

    const isValidPassword = await bcrypt.compare(password, user.USUAR_PA);
    if (!isValidPassword) {
      return unauthorized(res, 'Credenciales inválidas');
    }

    const tokens = generateTokenPair(user);

    return success(res, {
      usuario: {
        id: user.USUA_COD,
        nombre: user.USUAR_NM,
        email: user.USUAR_EM,
        rol: user.TM_ROLES?.ROLE_NOM ?? null,
        rolId: user.USUAR_RO,
        activo: user.USUAR_AC,
      },
      ...tokens,
    }, 'Inicio de sesión exitoso');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Registra un nuevo usuario (solo administradores deberían usar esto en producción)
 */
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rolId, paisId, desdePanel } = req.body;

    const existingUser = await prisma.tM_USUAR.findUnique({
      where: { USUAR_EM: email },
    });

    if (existingUser) {
      return error(res, 'Ya existe un usuario registrado con ese correo electrónico', 409);
    }

    // Determinar rol automáticamente si no se especifica
    let assignedRolId = rolId;
    if (!assignedRolId) {
      const roleName = desdePanel ? 'Gestor Turístico' : 'Prestador Servicio';
      const role = await prisma.tM_ROLES.findUnique({
        where: { ROLE_NOM: roleName },
      });
      if (!role) {
        return error(res, `Rol por defecto "${roleName}" no encontrado en la base de datos`, 500);
      }
      assignedRolId = role.ROLE_COD;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.tM_USUAR.create({
      data: {
        USUAR_NM: nombre,
        USUAR_EM: email,
        USUAR_PA: hashedPassword,
        USUAR_RO: assignedRolId,
        USUAR_PO: paisId ?? null,
        USUAR_AC: true,
      },
      select: {
        USUA_COD: true,
        USUAR_NM: true,
        USUAR_EM: true,
        USUAR_RO: true,
        USUAR_AC: true,
        USUAR_FR: true,
      },
    });

    // Enviar correo de bienvenida (no bloquea la respuesta)
    sendWelcomeEmail({ email, nombre }).catch((e) =>
      console.warn('No se pudo enviar correo de bienvenida:', e.message)
    );

    return created(res, newUser, 'Usuario registrado exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Genera un nuevo access token a partir de un refresh token válido
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return unauthorized(res, 'Refresh token requerido');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return unauthorized(res, 'Refresh token inválido o expirado');
    }

    const user = await prisma.tM_USUAR.findUnique({
      where: { USUA_COD: decoded.sub },
      include: { TM_ROLES: true },
    });

    if (!user || !user.USUAR_AC) {
      return unauthorized(res, 'Usuario no encontrado o desactivado');
    }

    const tokens = generateTokenPair(user);
    return success(res, tokens, 'Token renovado exitosamente');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Retorna el perfil del usuario autenticado
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.tM_USUAR.findUnique({
      where: { USUA_COD: req.user.sub },
      select: {
        USUA_COD: true,
        USUAR_NM: true,
        USUAR_EM: true,
        USUAR_AC: true,
        USUAR_FR: true,
        TM_ROLES: { select: { ROLE_COD: true, ROLE_NOM: true } },
        TM_PAISE: { select: { PAIS_NOM: true } },
      },
    });

    if (!user) {
      return notFound(res, 'Usuario no encontrado');
    }

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 * Envía un correo con un enlace para restablecer la contraseña
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return error(res, 'El correo electrónico es requerido');
    }

    const user = await prisma.tM_USUAR.findUnique({
      where: { USUAR_EM: email },
    });

    // No revelar si el usuario existe o no por seguridad
    if (!user) {
      return success(res, null, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
    }

    const resetToken = generateResetToken(user);
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar correo (no bloquea la respuesta)
    sendPasswordResetEmail({
      email: user.USUAR_EM,
      nombre: user.USUAR_NM,
      resetUrl,
    }).catch((e) => console.warn('No se pudo enviar correo de recuperación:', e.message));

    return success(res, null, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 * Restablece la contraseña usando un token válido
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return error(res, 'Token y nueva contraseña son requeridos');
    }

    if (password.length < 8) {
      return error(res, 'La contraseña debe tener al menos 8 caracteres');
    }

    let decoded;
    try {
      decoded = verifyResetToken(token);
    } catch {
      return error(res, 'Token inválido o expirado. Solicita un nuevo restablecimiento.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.tM_USUAR.update({
      where: { USUA_COD: decoded.sub },
      data: { USUAR_PA: hashedPassword },
    });

    return success(res, null, 'Contraseña restablecida exitosamente.');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, refreshToken, getMe, forgotPassword, resetPassword };
