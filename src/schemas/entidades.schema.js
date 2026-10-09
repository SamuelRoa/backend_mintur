const { z } = require('zod');

const vialidadEnum = z.enum(['Buena', 'Regular', 'Mala'], { message: 'Vialidad inválida' });

const destinoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().trim().max(2000).nullish(),
  vialidad: vialidadEnum.optional(),
  tipoTurismoId: z.coerce.number().int().min(1, 'Tipo de turismo inválido'),
  municipioId: z.coerce.number().int().min(1, 'Municipio inválido'),
  lat: z.coerce.number().min(-90).max(90, 'Latitud inválida').nullish(),
  lon: z.coerce.number().min(-180).max(180, 'Longitud inválida').nullish(),
  direccion: z.string().trim().max(500).nullish(),
  imagenUrl: z.string().trim().max(500).nullish(),
  destacado: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

const rutaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().trim().max(2000).nullish(),
  duracionHoras: z.coerce.number().positive('Duración inválida').nullish(),
  distanciaKm: z.coerce.number().positive('Distancia inválida').nullish(),
  vialidad: vialidadEnum.optional(),
  tipoTurismoId: z.coerce.number().int().min(1, 'Tipo de turismo inválido').nullish(),
  destinos: z.array(z.object({
    destinoId: z.coerce.number().int().min(1, 'Destino inválido'),
    orden: z.coerce.number().int().min(0).optional(),
  })).min(1, 'La ruta debe tener al menos un destino').optional(),
  destacado: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

const prestadorTipoEnum = z.enum(['hosped', 'rest', 'transp'], { message: 'Tipo de prestador inválido' });
const prestadorEstadoEnum = z.enum(['pend', 'validado', 'rechazado'], { message: 'Estado inválido' });

const prestadorSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(200),
  tipo: prestadorTipoEnum,
  email: z.string().trim().toLowerCase().pipe(z.string().email('Correo inválido')).nullish(),
  telefono: z.string().trim().max(30).nullish(),
  web: z.string().trim().max(200).nullish(),
  municipioId: z.coerce.number().int().min(1, 'Municipio inválido'),
  lat: z.coerce.number().min(-90).max(90).nullish(),
  lon: z.coerce.number().min(-180).max(180).nullish(),
  direccion: z.string().trim().max(500).nullish(),
  hospe: z.object({
    categoria: z.string().trim().min(1).max(100),
    numHabitaciones: z.coerce.number().int().min(0).nullish(),
    horario: z.string().trim().max(100).nullish(),
  }).nullish(),
  gastr: z.object({
    tipoGastronomia: z.string().trim().min(1).max(100),
    horario: z.string().trim().max(100).nullish(),
  }).nullish(),
  trans: z.object({
    tipoVehiculo: z.string().trim().min(1).max(100),
    capacidad: z.coerce.number().int().min(1).nullish(),
    ruc: z.string().trim().max(50).nullish(),
  }).nullish(),
});

const prestadorEstadoSchema = z.object({ estado: prestadorEstadoEnum });

const eventoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().trim().max(2000).nullish(),
  fechaInicio: z.string().trim().min(1, 'Fecha de inicio requerida'),
  fechaFin: z.string().trim().nullish(),
  tipoEventoId: z.coerce.number().int().min(1, 'Tipo de evento inválido'),
  destinoId: z.coerce.number().int().min(1, 'Destino inválido'),
  imagenUrl: z.string().trim().max(500).nullish(),
  destacado: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

const opinionSchema = z.object({
  calificacion: z.coerce.number().int().min(1, 'Calificación mínima 1').max(5, 'Calificación máxima 5'),
  comentario: z.string().trim().max(1000).nullish(),
  destinoId: z.coerce.number().int().min(1, 'Destino inválido'),
});

const consultaSchema = z.object({
  contenido: z.string().trim().min(1, 'El contenido es requerido').max(2000),
  canal: z.string().trim().max(20).optional(),
  usuarioId: z.coerce.number().int().min(1).nullish(),
});

const responderConsultaSchema = z.object({
  respuesta: z.string().trim().min(1, 'La respuesta es requerida').max(2000),
  emailDestinatario: z.string().trim().toLowerCase().pipe(z.string().email('Correo inválido')).nullish(),
});

const contenidoSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es requerido').max(200),
  tipo: z.string().trim().min(1, 'El tipo es requerido').max(20),
  descripcion: z.string().trim().max(5000).nullish(),
  url: z.string().trim().max(500).nullish(),
  destinoId: z.coerce.number().int().min(1, 'Destino inválido').nullish(),
});

const usuarioUpdateSchema = z.object({
  nombre: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().pipe(z.string().email('Correo inválido')).optional(),
  rolId: z.coerce.number().int().min(1, 'Rol inválido').optional(),
  activo: z.boolean().optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
});

module.exports = {
  destinoSchema, rutaSchema, prestadorSchema, prestadorEstadoSchema,
  eventoSchema, opinionSchema, consultaSchema, responderConsultaSchema,
  contenidoSchema, usuarioUpdateSchema,
};
