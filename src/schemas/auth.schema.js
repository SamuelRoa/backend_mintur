const { z } = require('zod');

const emailSchema = z.string().trim().toLowerCase().pipe(z.string().email('Correo electrónico inválido'));

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, 'La contraseña es requerida'),
});

const registerSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  email: emailSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rolId: z.coerce.number().int().min(1, 'Rol inválido').nullish(),
  paisId: z.coerce.number().int().min(1, 'País inválido').nullish(),
  desdePanel: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Token requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token requerido').optional(),
}).passthrough();

module.exports = { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, refreshSchema };
