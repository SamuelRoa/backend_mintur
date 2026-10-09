const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Limpiar datos existentes en orden de dependencias
  console.log("  Limpiando datos existentes...");
  await prisma.tM_COTUR.deleteMany();
  await prisma.tM_COINS.deleteMany();
  await prisma.tM_OPINI.deleteMany();
  await prisma.tM_CONSU.deleteMany();
  await prisma.tM_EVENT.deleteMany();
  await prisma.tM_TRANS.deleteMany();
  await prisma.tM_GASTR.deleteMany();
  await prisma.tM_HOSPE.deleteMany();
  await prisma.tM_UBSER.deleteMany();
  await prisma.tM_PRSER.deleteMany();
  await prisma.tM_UBDES.deleteMany();
  await prisma.tM_DESTI.deleteMany();
  await prisma.tM_RUTAT.deleteMany();
  await prisma.tR_RUTDE.deleteMany();
  await prisma.tR_RUTHO.deleteMany();
  await prisma.tR_RUTGA.deleteMany();
  await prisma.tR_USU_REGI.deleteMany();
  await prisma.tM_USUAR.deleteMany();
  await prisma.tM_TIEVE.deleteMany();
  await prisma.tM_TITUR.deleteMany();
  await prisma.tM_ROLES.deleteMany();
  await prisma.tM_PARRO.deleteMany();
  await prisma.tM_MUNIC.deleteMany();
  await prisma.tM_ESTADO.deleteMany();
  await prisma.tM_CORPO.deleteMany();
  await prisma.tM_REGION.deleteMany();
  await prisma.tM_PAISE.deleteMany();
  console.log("  ✔ Datos limpiados");

  // Resetear secuencias auto-increment de PostgreSQL
  const sequences = [
    'tm_paise_pais_cod_seq', 'tm_region_regi_cod_seq', 'tm_corpo_corp_cod_seq',
    'tm_estado_esta_cod_seq', 'tm_munic_muni_cod_seq',
    'tm_titur_titu_cod_seq', 'tm_tieve_tiev_cod_seq', 'tm_usuar_usua_cod_seq',
    'tm_desti_dest_cod_seq', 'tm_ubdes_ubde_cod_seq', 'tm_prser_prse_cod_seq',
    'tm_event_even_cod_seq', 'tm_rutat_ruta_cod_seq', 'tr_rutde_rtde_cod_seq',
    'tm_opini_opin_cod_seq', 'tm_consu_cons_cod_seq', 'tm_cotur_cotu_cod_seq',
  ];
  for (const seq of sequences) {
    try {
      await prisma.$queryRawUnsafe(`ALTER SEQUENCE "${seq}" RESTART WITH 1`);
    } catch { /* seq may not exist */ }
  }
  console.log("  ✔ Secuencias reiniciadas");

  // =============================================
  // 1. PAÍS
  // =============================================
  const pais = await prisma.tM_PAISE.upsert({
    where: { PAIS_NOM: "Venezuela" },
    update: {},
    create: { PAIS_NOM: "Venezuela" },
  });
  console.log("  ✔ País creado");

  // =============================================
  // 2. REGIONES
  // =============================================
  const regionesNom = [
    "Los Andes", "Llanos", "Zulia-Lara-Falcón", "Central",
    "Amazonía", "Insular", "Oriental",
  ];
  const regiones = {};
  for (const nom of regionesNom) {
    const created = await prisma.tM_REGION.create({ data: { REGI_NOM: nom } });
    regiones[nom] = created.REGI_COD;
  }
  console.log("  ✔ 7 regiones creadas");

  // =============================================
  // 3. CORPORACIONES
  // =============================================
  const corporacionesData = [
    { sig: "CORPOANDES", nom: "Corporación de Turismo de Los Andes", reg: "Los Andes" },
    { sig: "CORPOLLANOS", nom: "Corporación de Turismo de Los Llanos", reg: "Llanos" },
    { sig: "CORPOZULIA", nom: "Corporación de Turismo de Zulia-Lara-Falcón", reg: "Zulia-Lara-Falcón" },
    { sig: "CORPOCENTRAL", nom: "Corporación de Turismo de la Región Central", reg: "Central" },
    { sig: "CORPOAMAZON", nom: "Corporación de Turismo de la Amazonía", reg: "Amazonía" },
    { sig: "CORPOINSULAR", nom: "Corporación de Turismo Insular", reg: "Insular" },
    { sig: "CORPOORIENTE", nom: "Corporación de Turismo de Oriente", reg: "Oriental" },
  ];
  for (const c of corporacionesData) {
    await prisma.tM_CORPO.create({
      data: { CORP_SIG: c.sig, CORP_NOM: c.nom, CORP_REG: regiones[c.reg] },
    });
  }
  console.log("  ✔ Corporaciones creadas");

  // =============================================
  // 4. ESTADOS
  // =============================================
  const regionToEstados = {
    "Los Andes": ["Mérida", "Táchira", "Trujillo"],
    "Llanos": ["Apure", "Barinas", "Portuguesa", "Guárico", "Cojedes"],
    "Zulia-Lara-Falcón": ["Zulia", "Lara", "Falcón"],
    "Central": ["Distrito Capital", "Miranda", "La Guaira", "Aragua", "Carabobo"],
    "Amazonía": ["Amazonas", "Bolívar"],
    "Insular": ["Nueva Esparta", "Dependencias Federales"],
    "Oriental": ["Anzoátegui", "Monagas", "Sucre", "Delta Amacuro"],
  };
  const estados = {};
  for (const [regNom, estList] of Object.entries(regionToEstados)) {
    for (const estNom of estList) {
      const created = await prisma.tM_ESTADO.create({
        data: { ESTA_NOM: estNom, ESTA_REGI: regiones[regNom] },
      });
      estados[estNom] = created.ESTA_COD;
    }
  }
  console.log("  ✔ 24 estados creados");

  // =============================================
  // 5. MUNICIPIOS (4 por estado)
  // =============================================
  const municipiosData = [
    { nom: "Libertador", est: "Mérida" },
    { nom: "Campo Elías", est: "Mérida" },
    { nom: "Sucre", est: "Mérida" },
    { nom: "Rangel", est: "Mérida" },
    { nom: "San Cristóbal", est: "Táchira" },
    { nom: "Cárdenas", est: "Táchira" },
    { nom: "Jáuregui", est: "Táchira" },
    { nom: "Junín", est: "Táchira" },
    { nom: "Trujillo", est: "Trujillo" },
    { nom: "Valera", est: "Trujillo" },
    { nom: "Escuque", est: "Trujillo" },
    { nom: "Boconó", est: "Trujillo" },
    { nom: "San Fernando", est: "Apure" },
    { nom: "Achaguas", est: "Apure" },
    { nom: "Biruaca", est: "Apure" },
    { nom: "Muñoz", est: "Apure" },
    { nom: "Barinas", est: "Barinas" },
    { nom: "Bolívar", est: "Barinas" },
    { nom: "Cruz Paredes", est: "Barinas" },
    { nom: "Obispos", est: "Barinas" },
    { nom: "Guanare", est: "Portuguesa" },
    { nom: "Acarigua", est: "Portuguesa" },
    { nom: "Araure", est: "Portuguesa" },
    { nom: "Ospino", est: "Portuguesa" },
    { nom: "San Juan de los Morros", est: "Guárico" },
    { nom: "Calabozo", est: "Guárico" },
    { nom: "Valle de la Pascua", est: "Guárico" },
    { nom: "Zaraza", est: "Guárico" },
    { nom: "Camaguán", est: "Guárico" },
    { nom: "San Carlos", est: "Cojedes" },
    { nom: "Tinaquillo", est: "Cojedes" },
    { nom: "El Baúl", est: "Cojedes" },
    { nom: "Ezequiel Zamora", est: "Cojedes" },
    { nom: "Maracaibo", est: "Zulia" },
    { nom: "San Francisco", est: "Zulia" },
    { nom: "Cabimas", est: "Zulia" },
    { nom: "Catatumbo", est: "Zulia" },
    { nom: "Barquisimeto", est: "Lara" },
    { nom: "Cabudare", est: "Lara" },
    { nom: "Carora", est: "Lara" },
    { nom: "Quíbor", est: "Lara" },
    { nom: "Coro", est: "Falcón" },
    { nom: "Punto Fijo", est: "Falcón" },
    { nom: "Puerto Cumarebo", est: "Falcón" },
    { nom: "Miranda", est: "Falcón" },
    { nom: "Tucacas", est: "Falcón" },
    { nom: "Libertador", est: "Distrito Capital" },
    { nom: "Baruta", est: "Miranda" },
    { nom: "Chacao", est: "Miranda" },
    { nom: "Sucre", est: "Miranda" },
    { nom: "El Hatillo", est: "Miranda" },
    { nom: "La Guaira", est: "La Guaira" },
    { nom: "Catia La Mar", est: "La Guaira" },
    { nom: "Macuto", est: "La Guaira" },
    { nom: "Carayaca", est: "La Guaira" },
    { nom: "Maracay", est: "Aragua" },
    { nom: "Turmero", est: "Aragua" },
    { nom: "Cagua", est: "Aragua" },
    { nom: "La Victoria", est: "Aragua" },
    { nom: "Valencia", est: "Carabobo" },
    { nom: "Naguanagua", est: "Carabobo" },
    { nom: "Puerto Cabello", est: "Carabobo" },
    { nom: "San Diego", est: "Carabobo" },
    { nom: "Puerto Ayacucho", est: "Amazonas" },
    { nom: "Atures", est: "Amazonas" },
    { nom: "Autana", est: "Amazonas" },
    { nom: "Manapiare", est: "Amazonas" },
    { nom: "Ciudad Bolívar", est: "Bolívar" },
    { nom: "Ciudad Guayana", est: "Bolívar" },
    { nom: "Upata", est: "Bolívar" },
    { nom: "Gran Sabana", est: "Bolívar" },
    { nom: "Porlamar", est: "Nueva Esparta" },
    { nom: "La Asunción", est: "Nueva Esparta" },
    { nom: "Juan Griego", est: "Nueva Esparta" },
    { nom: "Antolín del Campo", est: "Nueva Esparta" },
    { nom: "Los Roques", est: "Dependencias Federales" },
    { nom: "La Orchila", est: "Dependencias Federales" },
    { nom: "La Tortuga", est: "Dependencias Federales" },
    { nom: "Barcelona", est: "Anzoátegui" },
    { nom: "Puerto La Cruz", est: "Anzoátegui" },
    { nom: "Lechería", est: "Anzoátegui" },
    { nom: "Sotillo", est: "Anzoátegui" },
    { nom: "Maturín", est: "Monagas" },
    { nom: "Caripe", est: "Monagas" },
    { nom: "Aguasay", est: "Monagas" },
    { nom: "Cumaná", est: "Sucre" },
    { nom: "Carúpano", est: "Sucre" },
    { nom: "Río Caribe", est: "Sucre" },
    { nom: "Arismendi", est: "Sucre" },
    { nom: "Bermúdez", est: "Sucre" },
    { nom: "Tucupita", est: "Delta Amacuro" },
    { nom: "Pedernales", est: "Delta Amacuro" },
    { nom: "Antonio Díaz", est: "Delta Amacuro" },
  ];
  const municipios = {};
  for (const m of municipiosData) {
    const created = await prisma.tM_MUNIC.create({
      data: { MUNI_NOM: m.nom, MUNI_EST: estados[m.est] },
    });
    const key = m.nom.toLowerCase().replace(/\s+/g, "-");
    municipios[key] = created.MUNI_COD;
    municipios[m.nom] = created.MUNI_COD;
    // Compound key to handle duplicate municipio names across states
    const compoundKey = `${key}-${m.est.toLowerCase().replace(/\s+/g, "-")}`;
    municipios[compoundKey] = created.MUNI_COD;
  }
  console.log("  ✔ 97 municipios creados");

  // =============================================
  // 6. ROLES
  // =============================================
  const rolesData = [
    { nom: "Administrador", des: "Acceso total al sistema" },
    { nom: "Validador", des: "Puede validar prestadores y contenido" },
    { nom: "Editor", des: "Puede gestionar contenido turístico" },
    { nom: "Soporte", des: "Atención al ciudadano y consultas" },
  ];
  const roles = {};
  for (const r of rolesData) {
    const created = await prisma.tM_ROLES.create({
      data: { ROLE_NOM: r.nom, ROLE_DES: r.des },
    });
    roles[r.nom] = created.ROLE_COD;
  }
  console.log("  ✔ Roles creados");

  // =============================================
  // 7. TIPOS DE TURISMO
  // =============================================
  const tiposTurismoData = [
    "Aventura",
    "Ecoturismo",
    "Sol y Playa",
    "Cultural",
    "Gastronomía",
    "Religioso",
    "Patrimonio",
    "Naturaleza",
  ];
  const tiposTurismo = {};
  for (const t of tiposTurismoData) {
    const created = await prisma.tM_TITUR.create({
      data: { TITU_NOM: t, TITU_DES: `Turismo de tipo ${t}` },
    });
    tiposTurismo[t] = created.TITU_COD;
  }
  console.log("  ✔ Tipos de turismo creados");

  // =============================================
  // 8. TIPOS DE EVENTO
  // =============================================
  const tiposEventoData = [
    { nom: "Cultural", des: "Eventos culturales, festivales y tradiciones" },
    { nom: "Deportivo", des: "Competencias y eventos deportivos" },
    { nom: "Gastronómico", des: "Ferias y festivales gastronómicos" },
    { nom: "Religioso", des: "Celebraciones religiosas y procesiones" },
    { nom: "Musical", des: "Conciertos y festivales musicales" },
    { nom: "Feria", des: "Ferias internacionales y exposiciones" },
  ];
  const tiposEvento = {};
  for (const t of tiposEventoData) {
    const created = await prisma.tM_TIEVE.create({
      data: { TIEV_NOM: t.nom, TIEV_DES: t.des },
    });
    tiposEvento[t.nom] = created.TIEV_COD;
  }
  console.log("  ✔ Tipos de evento creados");

  // =============================================
  // 9. USUARIOS
  // =============================================
  const hash = await bcrypt.hash("cotatur2026", 10);
  let adminUser;
  for (const u of [
    { em: "admin@cotatur.gob.ve", nm: "Administrador COTATUR", ro: "Administrador" },
    { em: "validador@cotatur.gob.ve", nm: "Validador COTATUR", ro: "Validador" },
    { em: "prestador@correo.com", nm: "Prestador Demo", ro: "Editor" },
  ]) {
    const created = await prisma.tM_USUAR.create({
      data: {
        USUAR_NM: u.nm,
        USUAR_EM: u.em,
        USUAR_PA: hash,
        USUAR_PO: pais.PAIS_COD,
        USUAR_AC: true,
        USUAR_RO: roles[u.ro],
      },
    });
    if (u.em === "admin@cotatur.gob.ve") adminUser = created;
  }
  console.log("  ✔ Usuarios creados");

  // =============================================
  // 10. DESTINOS TURÍSTICOS (3+ por región)
  // =============================================
  const DEST_IMG_MAP = {
    "San Pedro del Río": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970850/mintur/destinos/San_Pedro.jpg",
    "Pico Bolívar": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970842/mintur/destinos/Pico_Bolivar.jpg",
    "Páramo El Zumbador": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970839/mintur/destinos/Paramo_zumbador.webp",
    "Médanos de Coro": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970834/mintur/destinos/Medanos_Coro.jpg",
    "Relámpago del Catatumbo": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970847/mintur/destinos/relampago_catatumbo.webp",
    "Obelisco de Barquisimeto": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970838/mintur/destinos/Obelisco_Barquisimeto.jpg",
    "Parque Nacional Morrocoy": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970836/mintur/destinos/Morrocoy.jpg",
    "Parque Nacional El Ávila": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970825/mintur/destinos/Avila.jpg",
    "Parque Nacional Henri Pittier": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970831/mintur/destinos/Hneri_Pittier.jpg",
    "Museo de Bellas Artes": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970837/mintur/destinos/Museo_Bellas_Artes.jpg",
    "Caracas": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782972215/mintur/destinos/Caracas.jpg",
    "Ciudad Bolívar": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782972220/mintur/destinos/Ciudad_Bolivar.jpg",
    "San Fernando de Apure": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970849/mintur/destinos/san_fernando_apure.jpg",
    "Hato El Cedral": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970830/mintur/destinos/Hato_El_Cedral.jpg",
    "Los Esteros de Camaguán": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970829/mintur/destinos/esteros_camaguan.jpg",
    "Cerro Autana": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970827/mintur/destinos/Cerro_Autana.jpg",
    "Puerto Ayacucho": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970845/mintur/destinos/Puerto_Ayacucho.jpg",
    "Parque La Llovizna": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970841/mintur/destinos/Parque_La_Llovizna.jpg",
    "Playa El Agua": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970844/mintur/destinos/Playa_ElAgua.webp",
    "Castillo de la Galera": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970826/mintur/destinos/castillo_san_carlos_borromeo.jpg",
    "Parque Nacional Mochima": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970835/mintur/destinos/Mochima.jpg",
    "Parque Nacional Canaima": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970826/mintur/destinos/Canaima.jpg",
    "Monte Roraima": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970848/mintur/destinos/Roraima.jpg",
    "Cueva del Guácharo": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970832/mintur/destinos/La_Cueva_del_Guacharo.jpg",
    "Cerro El Morro": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970828/mintur/destinos/Cerro_El_Morro.jpg",
    "Laguna de Mucubají": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782972217/mintur/destinos/LagunaMucubaji.jpg",
    "Colonia Tovar": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782972216/mintur/destinos/Colonia_Tovar.jpg",
    "Santuario de la Virgen de Coromoto": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782970849/mintur/destinos/Santuario_Virgen_Coromoto.jpg",
    "Archipiélago Los Roques": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1782972218/mintur/destinos/Los_Roques.jpg",
  };

  const destinosData = [
    // Los Andes (región 1)
    {
      nom: "San Pedro del Río",
      des: "Pueblo colonial empedrado, declarado Monumento Histórico Nacional. Sus calles angostas y casas de techos rojos evocan la época colonial.",
      via: "Buena",
      ttu: "Patrimonio",
      mun: "San Cristóbal",
      est: "Táchira",
      lat: 7.8333,
      lon: -72.3667,
      dir: "Vía principal, San Pedro del Río, Táchira",
    },
    {
      nom: "Pico Bolívar",
      des: "La cumbre más alta de Venezuela (4.978 msnm). Andinismo, teleférico y paisajes de alta montaña.",
      via: "Regular",
      ttu: "Aventura",
      mun: "Libertador",
      est: "Mérida",
      lat: 8.5479,
      lon: -71.0489,
      dir: "Sierra Nevada, Mérida",
    },
    {
      nom: "Laguna de Mucubají",
      des: "Laguna glaciar en el Parque Nacional Sierra Nevada a 3.600 msnm. Paisaje de páramo con frailejones.",
      via: "Regular",
      ttu: "Naturaleza",
      mun: "Rangel",
      est: "Mérida",
      lat: 8.7833,
      lon: -70.8167,
      dir: "Vía Barinas, Parque Nacional Sierra Nevada",
    },
    {
      nom: "Páramo El Zumbador",
      des: "Páramo andino a más de 3.000 msnm, ideal para senderismo y avistamiento de aves.",
      via: "Regular",
      ttu: "Aventura",
      mun: "Jáuregui",
      est: "Táchira",
      lat: 8.0894,
      lon: -71.9436,
      dir: "Carretera San Cristóbal-La Fría, Táchira",
    },
    // Zulia-Lara-Falcón (región 3)
    {
      nom: "Médanos de Coro",
      des: "Parque Nacional de dunas doradas únicas en el Caribe sur. Ideal para sandboard y fotografía.",
      via: "Buena",
      ttu: "Naturaleza",
      mun: "Miranda",
      est: "Falcón",
      lat: 11.45,
      lon: -69.6667,
      dir: "Vía Coro-Punto Fijo, Parque Nacional Médanos",
    },
    {
      nom: "Relámpago del Catatumbo",
      des: "Fenómeno atmosférico único en el mundo. Tormentas eléctricas sobre el Lago de Maracaibo.",
      via: "Regular",
      ttu: "Naturaleza",
      mun: "Catatumbo",
      est: "Zulia",
      lat: 9.15,
      lon: -71.7,
      dir: "Municipio Catatumbo, estado Zulia",
    },
    {
      nom: "Obelisco de Barquisimeto",
      des: "Símbolo de la ciudad crepuscular y su música tradicional. Mirador con vista panorámica.",
      via: "Buena",
      ttu: "Patrimonio",
      mun: "Barquisimeto",
      est: "Lara",
      lat: 10.0647,
      lon: -69.3467,
      dir: "Av. Obelisco, Barquisimeto",
    },
    {
      nom: "Parque Nacional Morrocoy",
      des: "Parque marino costero con cayos, manglares y playas de ensueño en el estado Falcón.",
      via: "Buena",
      ttu: "Sol y Playa",
      mun: "Tucacas",
      est: "Falcón",
      lat: 10.85,
      lon: -68.2667,
      dir: "Vía Tucacas, Falcón",
    },
    // Central (región 4)
    {
      nom: "Parque Nacional El Ávila",
      des: "Montaña emblemática de Caracas con senderos, teleférico y vista panorámica de la ciudad.",
      via: "Buena",
      ttu: "Aventura",
      mun: "Libertador",
      est: "Distrito Capital",
      lat: 10.5333,
      lon: -66.8833,
      dir: "Estación Teleférico, Caracas",
    },
    {
      nom: "Parque Nacional Henri Pittier",
      des: "Primer parque nacional de Venezuela, selva nublada y playas en la costa aragüeña.",
      via: "Regular",
      ttu: "Naturaleza",
      mun: "Maracay",
      est: "Aragua",
      lat: 10.35,
      lon: -67.6833,
      dir: "Vía Maracay-Choroní, Aragua",
    },
    {
      nom: "Museo de Bellas Artes",
      des: "Principal museo de arte de Venezuela, fundado en 1917. Arte nacional e internacional.",
      via: "Buena",
      ttu: "Cultural",
      mun: "Libertador",
      est: "Distrito Capital",
      lat: 10.5031,
      lon: -66.8916,
      dir: "Plaza de los Museos, Caracas",
    },
    {
      nom: "Colonia Tovar",
      des: "Pueblo de influencia alemana en las montañas aragüeñas, famoso por su gastronomía y arquitectura.",
      via: "Buena",
      ttu: "Cultural",
      mun: "Maracay",
      est: "Aragua",
      lat: 10.4,
      lon: -67.2833,
      dir: "Carretera Colonia Tovar, Aragua",
    },
    {
      nom: "Caracas",
      des: "Capital de Venezuela, centro cultural y turístico. Museos, plazas históricas, gastronomía diversa, El Ávila y vida urbana cosmopolita.",
      via: "Buena",
      ttu: "Cultural",
      mun: "Libertador",
      est: "Distrito Capital",
      lat: 10.4806,
      lon: -66.9036,
      dir: "Centro de Caracas, Distrito Capital",
    },
    // Llanos (región 2)
    {
      nom: "Santuario de la Virgen de Coromoto",
      des: "Santuario religioso más importante de Venezuela. Alberga la imagen de la Virgen de Coromoto, Patrona de Venezuela. Centro de peregrinación y fe.",
      via: "Buena",
      ttu: "Patrimonio",
      mun: "Guanare",
      est: "Portuguesa",
      lat: 8.5,
      lon: -68.2,
      dir: "Vía El Baúl, Cojedes",
    },
    {
      nom: "San Fernando de Apure",
      des: "Capital llanera: pisillo, hervido de gallina y joropo en vivo. Puerta de los Llanos.",
      via: "Buena",
      ttu: "Gastronomía",
      mun: "San Fernando",
      est: "Apure",
      lat: 7.8939,
      lon: -67.4711,
      dir: "Av. Principal, San Fernando de Apure",
    },
    {
      nom: "Hato El Cedral",
      des: "Hato llanero dedicado al turismo de naturaleza, con safaris, cabalgatas y observación de fauna.",
      via: "Regular",
      ttu: "Ecoturismo",
      mun: "San Fernando",
      est: "Apure",
      lat: 7.5833,
      lon: -69.2833,
      dir: "Vía El Cedral, Estado Apure",
    },
    {
      nom: "Los Esteros de Camaguán",
      des: "Humedales y esteros en la llanura venezolana. Refugio de aves migratorias, garzas y jagüeyes. Paseos en bote y observación de fauna.",
      via: "Regular",
      ttu: "Naturaleza",
      mun: "Camaguán",
      est: "Guárico",
      lat: 8.0833,
      lon: -67.6167,
      dir: "Vía Camaguán, estado Guárico",
    },
    // Amazonía (región 5)
    {
      nom: "Cerro Autana",
      des: "Tepuy sagrado de los Piaroa, conocido como el 'árbol de la vida'. Formación única.",
      via: "Mala",
      ttu: "Naturaleza",
      mun: "Autana",
      est: "Amazonas",
      lat: 4.7333,
      lon: -67.4667,
      dir: "Municipio Autana, Estado Amazonas",
    },
    {
      nom: "Puerto Ayacucho",
      des: "Puerta de entrada a la Amazonia venezolana, raudales del Orinoco y cultura indígena.",
      via: "Regular",
      ttu: "Aventura",
      mun: "Puerto Ayacucho",
      est: "Amazonas",
      lat: 5.6633,
      lon: -67.6233,
      dir: "Av. Principal, Puerto Ayacucho",
    },
    {
      nom: "Parque La Llovizna",
      des: "Parque natural a orillas del río Caroní con cascadas, senderos y miradores. Ideal para ecoturismo y fotografía.",
      via: "Buena",
      ttu: "Naturaleza",
      mun: "Ciudad Guayana",
      est: "Bolívar",
      lat: 8.3069,
      lon: -62.7069,
      dir: "Av. Guayana, Ciudad Guayana, estado Bolívar",
    },
    {
      nom: "Ciudad Bolívar",
      des: "Capital histórica del estado Bolívar, ubicada a orillas del río Orinoco con plazas coloniales y arquitectura patrimonial.",
      via: "Buena",
      ttu: "Cultural",
      mun: "Ciudad Bolívar",
      est: "Bolívar",
      lat: 8.1228,
      lon: -62.7196,
      dir: "Av. Universidad, Ciudad Bolívar, estado Bolívar",
    },
    // Insular (región 6)
    {
      nom: "Playa El Agua",
      des: "Playa emblemática de Margarita, 4 km de arena dorada y brisa caribeña.",
      via: "Buena",
      ttu: "Sol y Playa",
      mun: "Antolín del Campo",
      est: "Nueva Esparta",
      lat: 11.1378,
      lon: -63.8214,
      dir: "Vía El Agua, Isla de Margarita",
    },
    {
      nom: "Castillo de la Galera",
      des: "Fortaleza colonial con vista panorámica a Juan Griego. Historia y arquitectura militar.",
      via: "Buena",
      ttu: "Patrimonio",
      mun: "Juan Griego",
      est: "Nueva Esparta",
      lat: 11.0833,
      lon: -63.95,
      dir: "Cerro La Galera, Juan Griego",
    },
    {
      nom: "Archipiélago Los Roques",
      des: "Parque nacional insular de aguas cristalinas, arrecifes de coral y playas de arena blanca.",
      via: "Buena",
      ttu: "Sol y Playa",
      mun: "Los Roques",
      est: "Dependencias Federales",
      lat: 11.8667,
      lon: -66.75,
      dir: "Isla Gran Roque, Los Roques",
    },
    // Oriental (región 7)
    {
      nom: "Parque Nacional Mochima",
      des: "Archipiélago caribeño con aguas turquesas, cayos vírgenes y diversidad marina.",
      via: "Buena",
      ttu: "Sol y Playa",
      mun: "Sotillo",
      est: "Anzoátegui",
      lat: 10.3667,
      lon: -64.3667,
      dir: "Vía Puerto La Cruz, Anzoátegui",
    },
    {
      nom: "Parque Nacional Canaima",
      des: "Patrimonio de la Humanidad. Hogar del Salto Ángel y tepuyes milenarios.",
      via: "Regular",
      ttu: "Naturaleza",
      mun: "Gran Sabana",
      est: "Bolívar",
      lat: 6.2333,
      lon: -62.85,
      dir: "Sector Canaima, Estado Bolívar",
    },
    {
      nom: "Monte Roraima",
      des: "Tepuy milenario que inspiró 'El Mundo Perdido' de Conan Doyle. Aventura única.",
      via: "Mala",
      ttu: "Aventura",
      mun: "Gran Sabana",
      est: "Bolívar",
      lat: 5.1431,
      lon: -60.7625,
      dir: "Parque Nacional Canaima, Sector Roraima",
    },
    {
      nom: "Cueva del Guácharo",
      des: "Parque nacional con una de las cuevas más grandes de Sudamérica, hogar del guácharo.",
      via: "Regular",
      ttu: "Ecoturismo",
      mun: "Caripe",
      est: "Monagas",
      lat: 10.1667,
      lon: -63.55,
      dir: "Carretera Caripe, Monagas",
    },
    {
      nom: "Cerro El Morro",
      des: "Imponente formación rocosa costera en el oriente venezolano. Playas vírgenes, senderismo y vista panorámica del mar Caribe.",
      via: "Buena",
      ttu: "Sol y Playa",
      mun: "Lechería",
      est: "Anzoátegui",
      lat: 10.19,
      lon: -64.69,
      dir: "Vía Lechería, estado Anzoátegui",
    },
  ];

  // Find municipality codes for destinos — match by name + state
  function findMunicipio(nom, est) {
    // First: find the exact municipio+estado combination in the raw data
    const match = municipiosData.find((m) => m.nom === nom && m.est === est);
    if (match) {
      const k = match.nom.toLowerCase().replace(/\s+/g, "-");
      const compoundKey = `${k}-${match.est.toLowerCase().replace(/\s+/g, "-")}`;
      return municipios[compoundKey] || municipios[k] || municipios[match.nom];
    }
    // Fallback: find first municipality in the state
    const anyInState = municipiosData.find((m) => m.est === est);
    if (anyInState) {
      const k = anyInState.nom.toLowerCase().replace(/\s+/g, "-");
      return municipios[k] || municipios[anyInState.nom];
    }
    return 1;
  }

  const destinos = {};
  for (let i = 0; i < destinosData.length; i++) {
    const d = destinosData[i];
    const muniId = findMunicipio(d.mun, d.est);
    const created = await prisma.tM_DESTI.create({
      data: {
        DEST_NOM: d.nom,
        DEST_DES: d.des,
        DEST_VIA: d.via,
        DEST_TTU: tiposTurismo[d.ttu],
        DEST_MUN: muniId,
        DEST_IMG: DEST_IMG_MAP[d.nom] || null,
        TM_UBDES: {
          create: {
            UBDE_LAT: d.lat,
            UBDE_LON: d.lon,
            UBDE_DIR: d.dir,
          },
        },
      },
      include: { TM_UBDES: true },
    });
    destinos[d.nom] = created.DEST_COD;
  }
  console.log(`  ✔ ${destinosData.length} destinos creados`);

  // =============================================
  // 11. PRESTADORES DE SERVICIOS (3+ por región)
  // =============================================
  const prestadoresData = [
    // Los Andes (región 1)
    {
      nom: "Hotel Bella Vista Mérida",
      tse: "hosped",
      ema: "reservas@bellavista.com",
      tel: "+58 414-1234567",
      web: "www.bellavistamerida.com",
      esv: "validado",
      mun: "Libertador",
      est: "Mérida",
      lat: 8.5833,
      lon: -71.1333,
      dir: "Av. Las Américas, Mérida",
      hospe: { cat: "4 estrellas", ndh: 45, hor: "24 horas" },
    },
    {
      nom: "Restaurante La Pesebrera",
      tse: "rest",
      ema: "pesebrera@correo.com",
      tel: "+58 276-5550101",
      web: "",
      esv: "validado",
      mun: "San Cristóbal",
      est: "Táchira",
      lat: 7.7669,
      lon: -72.225,
      dir: "Calle Principal, San Cristóbal",
      gastr: { tig: "Comida Típica Andina", hor: "12:00-22:00" },
    },
    {
      nom: "Posada La Montaña",
      tse: "hosped",
      ema: "info@posadamontana.com",
      tel: "+58 416-2345678",
      web: "",
      esv: "pendiente",
      mun: "Rangel",
      est: "Mérida",
      lat: 8.7833,
      lon: -70.8167,
      dir: "Vía Mucuchíes, Mérida",
      hospe: { cat: "Posada", ndh: 12, hor: "24 horas" },
    },
    {
      nom: "Trucha & Café Andino",
      tse: "rest",
      ema: "trucha@cafeandino.com",
      tel: "+58 412-7654321",
      web: "",
      esv: "validado",
      mun: "Libertador",
      est: "Mérida",
      lat: 8.55,
      lon: -71.0833,
      dir: "Av. 4, Mérida",
      gastr: { tig: "Cocina de Montaña", hor: "08:00-21:00" },
    },
    // Zulia-Lara-Falcón (región 3)
    {
      nom: "Transporte Turístico Maracaibo",
      tse: "transp",
      ema: "transporte@maracaibo.com",
      tel: "+58 414-5678901",
      web: "",
      esv: "validado",
      mun: "Maracaibo",
      est: "Zulia",
      lat: 10.65,
      lon: -71.6333,
      dir: "Av. Bella Vista, Maracaibo",
      trans: { tve: "Minibús", cpa: 15, ruc: "RUC-ZUL-001" },
    },
    {
      nom: "Posada Los Médanos",
      tse: "hosped",
      ema: "posada@medanos.com",
      tel: "+58 268-2525252",
      web: "",
      esv: "pendiente",
      mun: "Coro",
      est: "Falcón",
      lat: 11.4,
      lon: -69.6833,
      dir: "Vía Los Médanos, Coro",
      hospe: { cat: "Posada", ndh: 8, hor: "24 horas" },
    },
    {
      nom: "Restaurante El Crepusculo",
      tse: "rest",
      ema: "crepusculo@correo.com",
      tel: "+58 251-2323232",
      web: "",
      esv: "validado",
      mun: "Barquisimeto",
      est: "Lara",
      lat: 10.0647,
      lon: -69.3467,
      dir: "Av. Vargas, Barquisimeto",
      gastr: { tig: "Comida Regional Larense", hor: "11:00-23:00" },
    },
    // Central (región 4)
    {
      nom: "Hotel Humboldt",
      tse: "hosped",
      ema: "reservas@hotelhumboldt.com",
      tel: "+58 212-3415000",
      web: "www.hotelhumboldt.com",
      esv: "validado",
      mun: "Libertador",
      est: "Distrito Capital",
      lat: 10.5333,
      lon: -66.8833,
      dir: "Av. Ávila, Caracas",
      hospe: { cat: "4 estrellas", ndh: 80, hor: "24 horas" },
    },
    {
      nom: "Restaurante La Pizarra",
      tse: "rest",
      ema: "lapizarra@correo.com",
      tel: "+58 414-5566778",
      web: "www.lapizarrarestaurante.com",
      esv: "validado",
      mun: "Maracay",
      est: "Aragua",
      lat: 10.4,
      lon: -67.2833,
      dir: "Calle Real, Colonia Tovar",
      gastr: { tig: "Comida Alemana y Venezolana", hor: "09:00-22:00" },
    },
    {
      nom: "Parque Diviértete",
      tse: "hosped",
      ema: "info@diviertete.com",
      tel: "+58 212-9990000",
      web: "",
      esv: "validado",
      mun: "Baruta",
      est: "Miranda",
      lat: 10.4667,
      lon: -66.8667,
      dir: "Av. Principal de Baruta",
      hospe: { cat: "Parque Temático", ndh: 0, hor: "10:00-18:00" },
    },
    // Llanos (región 2)
    {
      nom: "Hotel Llanero",
      tse: "hosped",
      ema: "hotel@llanero.com",
      tel: "+58 416-3333333",
      web: "",
      esv: "validado",
      mun: "San Fernando",
      est: "Apure",
      lat: 7.8833,
      lon: -67.4667,
      dir: "Av. Principal, San Fernando",
      hospe: { cat: "3 estrellas", ndh: 30, hor: "24 horas" },
    },
    {
      nom: "Hato Safari Llanos",
      tse: "rest",
      ema: "safari@hato.com",
      tel: "+58 414-4444444",
      web: "",
      esv: "validado",
      mun: "San Fernando",
      est: "Apure",
      lat: 7.5833,
      lon: -69.2833,
      dir: "Hato El Cedral",
      gastr: { tig: "Comida Llanera", hor: "06:00-20:00" },
    },
    {
      nom: "Posada El Llano",
      tse: "hosped",
      ema: "posadaelllano@correo.com",
      tel: "+58 416-4455667",
      web: "",
      esv: "pendiente",
      mun: "Calabozo",
      est: "Guárico",
      lat: 8.9333,
      lon: -67.4333,
      dir: "Calle Principal, Calabozo",
      hospe: { cat: "Posada", ndh: 10, hor: "24 horas" },
    },
    // Amazonía (región 5)
    {
      nom: "Ecoturismo Canaima Aventura",
      tse: "transp",
      ema: "info@canaimaaventura.com",
      tel: "+58 424-8901234",
      web: "www.canaimaaventura.com",
      esv: "validado",
      mun: "Puerto Ayacucho",
      est: "Amazonas",
      lat: 5.6633,
      lon: -67.6233,
      dir: "Av. Amazonas, Puerto Ayacucho",
      trans: { tve: "Lancha", cpa: 20, ruc: "RUC-AMA-001" },
    },
    {
      nom: "Posada Selva Amazónica",
      tse: "hosped",
      ema: "selva@amazonia.com",
      tel: "+58 414-5556666",
      web: "",
      esv: "pendiente",
      mun: "Autana",
      est: "Amazonas",
      lat: 4.7333,
      lon: -67.4667,
      dir: "Sector Autana, Amazonas",
      hospe: { cat: "Ecolodge", ndh: 6, hor: "24 horas" },
    },
    // Insular (región 6)
    {
      nom: "Hotel Margarita Paradise",
      tse: "hosped",
      ema: "reservas@margaritaparadise.com",
      tel: "+58 414-6789012",
      web: "www.margaritaparadise.com",
      esv: "validado",
      mun: "Porlamar",
      est: "Nueva Esparta",
      lat: 10.9833,
      lon: -63.8333,
      dir: "Av. Raúl Leoni, Porlamar",
      hospe: { cat: "5 estrellas", ndh: 120, hor: "24 horas" },
    },
    {
      nom: "Restaurante Mariscos del Caribe",
      tse: "rest",
      ema: "mariscos@caribe.com",
      tel: "+58 295-4000000",
      web: "",
      esv: "validado",
      mun: "Porlamar",
      est: "Nueva Esparta",
      lat: 10.95,
      lon: -63.85,
      dir: "Malecón, Porlamar",
      gastr: { tig: "Mariscos y Pescados", hor: "11:00-23:00" },
    },
    {
      nom: "Transporte Insular Express",
      tse: "transp",
      ema: "transport@insular.com",
      tel: "+58 414-7778888",
      web: "",
      esv: "pendiente",
      mun: "Antolín del Campo",
      est: "Nueva Esparta",
      lat: 11.0833,
      lon: -63.85,
      dir: "Vía El Agua, Margarita",
      trans: { tve: "Camioneta", cpa: 12, ruc: "RUC-INS-001" },
    },
    // Oriental (región 7)
    {
      nom: "Posada Río Caribe",
      tse: "hosped",
      ema: "posada@riocaribe.com",
      tel: "+58 416-9999999",
      web: "",
      esv: "validado",
      mun: "Río Caribe",
      est: "Sucre",
      lat: 10.7,
      lon: -63.1167,
      dir: "Malecón, Río Caribe",
      hospe: { cat: "Posada", ndh: 15, hor: "24 horas" },
    },
    {
      nom: "Canaima Tours",
      tse: "transp",
      ema: "info@canaimatours.com",
      tel: "+58 414-8800000",
      web: "www.canaimatours.com",
      esv: "validado",
      mun: "Gran Sabana",
      est: "Bolívar",
      lat: 6.2333,
      lon: -62.85,
      dir: "Sector Canaima, Estado Bolívar",
      trans: { tve: "Avioneta", cpa: 8, ruc: "RUC-BOL-001" },
    },
    {
      nom: "Restaurante Costa Oriental",
      tse: "rest",
      ema: "costa@oriental.com",
      tel: "+58 281-2828282",
      web: "",
      esv: "validado",
      mun: "Puerto La Cruz",
      est: "Anzoátegui",
      lat: 10.2167,
      lon: -64.6333,
      dir: "Av. Costanera, Puerto La Cruz",
      gastr: { tig: "Cocina Oriental", hor: "11:00-23:00" },
    },
  ];

  // Helper to map esv values - admin panel expects: 'pendiente', 'validado', 'rechazado' 
  // Backend stores: 'pend', 'validado', 'rechazado'
  const esvMap = {
    pendiente: "pend",
    validado: "validado",
    rechazado: "rechazado",
  };

  for (const p of prestadoresData) {
    const muniId = findMunicipio(p.mun, p.est);
    const data = {
      PROV_NOM: p.nom,
      PROV_TSE: p.tse,
      PROV_EMA: p.ema,
      PROV_TEL: p.tel,
      PROV_WEB: p.web,
      PROV_ESV: esvMap[p.esv] || p.esv,
      PROV_MUN: muniId,
      TM_UBSER: {
        create: { UBSR_LAT: p.lat, UBSR_LON: p.lon, UBSR_DIR: p.dir },
      },
    };

    if (p.tse === "hosped" && p.hospe) {
      data.TM_HOSPE = {
        create: {
          HOSP_CAT: p.hospe.cat,
          HOSP_NDH: p.hospe.ndh,
          HOSP_HOR: p.hospe.hor,
        },
      };
    }
    if (p.tse === "rest" && p.gastr) {
      data.TM_GASTR = {
        create: {
          GAST_TIG: p.gastr.tig,
          GAST_HOR: p.gastr.hor,
        },
      };
    }
    if (p.tse === "transp" && p.trans) {
      data.TM_TRANS = {
        create: {
          TRAN_TVE: p.trans.tve,
          TRAN_CPA: p.trans.cpa,
          TRAN_RUC: p.trans.ruc,
        },
      };
    }

    await prisma.tM_PRSER.create({ data });
  }
  console.log(`  ✔ ${prestadoresData.length} prestadores creados`);

  // =============================================
  // 12. RUTAS TURÍSTICAS
  // =============================================
  const rutasData = [
    {
      nom: "Ruta de los Páramos",
      des: "Recorre los páramos andinos desde San Cristóbal hasta Mérida, atravesando paisajes de montaña y lagunas glaciares.",
      duh: 48,
      dis: 450,
      via: "Regular",
      ttu: "Aventura",
      destinos: ["San Pedro del Río", "Páramo El Zumbador", "Laguna de Mucubají", "Pico Bolívar"],
    },
    {
      nom: "Ruta del Sol y el Viento",
      des: "Desde las dunas doradas de Coro hasta el fenómeno del Relámpago del Catatumbo.",
      duh: 36,
      dis: 350,
      via: "Buena",
      ttu: "Naturaleza",
      destinos: ["Médanos de Coro", "Obelisco de Barquisimeto", "Relámpago del Catatumbo"],
    },
    {
      nom: "Ruta Capital y Costa",
      des: "Explora Caracas, su patrimonio cultural y las playas del Parque Nacional Henri Pittier.",
      duh: 24,
      dis: 180,
      via: "Buena",
      ttu: "Cultural",
      destinos: ["Parque Nacional El Ávila", "Museo de Bellas Artes", "Colonia Tovar", "Parque Nacional Henri Pittier"],
    },
    {
      nom: "Ruta del Llano Salvaje",
      des: "Adéntrate en las sabanas infinitas de Apure y Cojedes, donde la fauna llanera y el joropo son protagonistas.",
      duh: 36,
      dis: 380,
      via: "Regular",
      ttu: "Naturaleza",
      destinos: ["San Fernando de Apure", "Santuario de la Virgen de Coromoto", "Hato El Cedral"],
    },
    {
      nom: "Ruta Amazónica",
      des: "Navega el Orinoco y adéntrate en la selva amazónica para conocer el tepuy sagrado de los Piaroa.",
      duh: 96,
      dis: 600,
      via: "Mala",
      ttu: "Aventura",
      destinos: ["Puerto Ayacucho", "Cerro Autana", "Parque La Llovizna"],
    },
    {
      nom: "Ruta Insular",
      des: "Recorre la isla de Margarita, desde sus playas paradisíacas hasta sus fortalezas coloniales.",
      duh: 24,
      dis: 120,
      via: "Buena",
      ttu: "Sol y Playa",
      destinos: ["Playa El Agua", "Castillo de la Galera", "Archipiélago Los Roques"],
    },
    {
      nom: "Ruta Caribe Oriental",
      des: "Desde el Parque Nacional Mochima hasta Cumaná, navegando aguas turquesas y cayos vírgenes.",
      duh: 24,
      dis: 150,
      via: "Buena",
      ttu: "Sol y Playa",
      destinos: ["Parque Nacional Mochima", "Cueva del Guácharo"],
    },
    {
      nom: "Ruta Gran Sabana",
      des: "Atraviesa la inmensidad de la Gran Sabana hasta el Monte Roraima, tierra de tepuyes milenarios.",
      duh: 72,
      dis: 500,
      via: "Regular",
      ttu: "Aventura",
      destinos: ["Parque Nacional Canaima", "Monte Roraima"],
    },
  ];

  for (const r of rutasData) {
    await prisma.tM_RUTAT.create({
      data: {
        RUTA_NOM: r.nom,
        RUTA_DES: r.des,
        RUTA_DUH: r.duh,
        RUTA_DIS: r.dis,
        RUTA_VIA: r.via,
        RUTA_TTU: tiposTurismo[r.ttu],
        TR_RUTDE: {
          create: r.destinos.map((d, i) => ({
            RTDE_DES: destinos[d],
            RTDE_ORD: i + 1,
          })),
        },
      },
    });
  }
  console.log(`  ✔ ${rutasData.length} rutas creadas`);

  // =============================================
  // 13. EVENTOS (3+ por región)
  // =============================================
  const EVEN_IMG_MAP = {
    "Feria Internacional de San Sebastián": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014855/mintur/eventos/feria_san_sebastian.webp",
    "Ferias del Sol de Mérida": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014852/mintur/eventos/ferias_del_sol.jpg",
    "Festival del Café Tachirense": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014847/mintur/eventos/cafe.jpg",
    "Semana Santa en los Andes": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014859/mintur/eventos/semana_santa_andes.jpg",
    "Festival Mundial de la Gaita": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014856/mintur/eventos/festival_gaitas.jpg",
    "Feria de la Chinita": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014853/mintur/eventos/feria_chinita.jpg",
    "Procesión de la Divina Pastora": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014849/mintur/eventos/divina_pastora.jpg",
    "Diablos Danzantes de Yare": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014848/mintur/eventos/diablos_yare.jpg",
    "Concierto Sinfónico en el Ávila": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014857/mintur/eventos/festival_musical_avila.jpg",
    "Serie del Caribe": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014860/mintur/eventos/serie_del_caribe.jpg",
    "Exposición Agropecuaria de Barinas": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014853/mintur/eventos/feria_agropecuaria.webp",
    "Ferias de Elorza": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014850/mintur/eventos/elorza.jpg",
    "Encuentro Indígena del Orinoco": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014851/mintur/eventos/encuentro_indigena.jpg",
    "Feria del Orinoco": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014854/mintur/eventos/feria_del_orinoco.jpg",
    "Procesión Marítima de la Virgen del Valle": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014859/mintur/eventos/procesion_maritima.jpg",
    "Margarita Gastronómica": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014858/mintur/eventos/margarita_gastronomica.jpg",
    "Carnavales de El Callao": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014848/mintur/eventos/carnavales_callao.jpg",
    "Festival del Mar": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783014856/mintur/eventos/festival_del_mar.jpg",
    "Festival del Joropo": "https://res.cloudinary.com/dqe0chrwm/image/upload/v1783015395/mintur/eventos/Joropo.jpg",
  };

  const today = new Date();
  const eventosData = [
    // Los Andes
    {
      nom: "Feria Internacional de San Sebastián",
      des: "La feria más emblemática del Táchira: toros, música y cultura andina.",
      fi: new Date("2026-01-14"),
      ff: new Date("2026-01-31"),
      te: "Feria",
      dest: "San Pedro del Río",
    },
    {
      nom: "Ferias del Sol de Mérida",
      des: "Encuentro de artesanos, gastronomía y tradiciones andinas en el corazón de Mérida.",
      fi: new Date("2026-02-12"),
      ff: new Date("2026-02-15"),
      te: "Feria",
      dest: "Pico Bolívar",
    },
    {
      nom: "Festival del Café Tachirense",
      des: "Catas, rutas cafeteras y celebración de los productores andinos.",
      fi: addDays(today, 45),
      ff: addDays(today, 48),
      te: "Cultural",
      dest: "Páramo El Zumbador",
    },
    {
      nom: "Semana Santa en los Andes",
      des: "Procesiones y representaciones religiosas en los pueblos andinos.",
      fi: addDays(today, 30),
      ff: addDays(today, 37),
      te: "Religioso",
      dest: "Laguna de Mucubají",
    },
    // Zulia-Lara-Falcón
    {
      nom: "Festival Mundial de la Gaita",
      des: "Celebración de la música zuliana en plena temporada decembrina.",
      fi: addDays(today, 120),
      ff: addDays(today, 130),
      te: "Musical",
      dest: "Relámpago del Catatumbo",
    },
    {
      nom: "Feria de la Chinita",
      des: "Festividad en honor a la Virgen de Chiquinquirá en Maracaibo.",
      fi: new Date("2026-11-11"),
      ff: new Date("2026-11-18"),
      te: "Religioso",
      dest: "Relámpago del Catatumbo",
    },
    {
      nom: "Procesión de la Divina Pastora",
      des: "Una de las manifestaciones religiosas más multitudinarias de Venezuela. La imagen de la Divina Pastora recorre las calles de Barquisimeto cada 14 de enero, congregando a millones de fieles.",
      fi: addDays(today, 196),
      ff: addDays(today, 196),
      te: "Religioso",
      dest: "Obelisco de Barquisimeto",
    },
    // Central
    {
      nom: "Diablos Danzantes de Yare",
      des: "Tradición religiosa afro-venezolana, Patrimonio de la Humanidad.",
      fi: new Date("2026-06-04"),
      ff: new Date("2026-06-06"),
      te: "Religioso",
      dest: "Parque Nacional Henri Pittier",
    },
    {
      nom: "Concierto Sinfónico en el Ávila",
      des: "Concierto al aire libre de la Orquesta Sinfónica de Venezuela.",
      fi: addDays(today, 35),
      ff: addDays(today, 35),
      te: "Musical",
      dest: "Parque Nacional El Ávila",
    },
    {
      nom: "Serie del Caribe",
      des: "El torneo de béisbol más importante del Caribe, reuniendo a los campeones de las ligas invernales de Venezuela, República Dominicana, Puerto Rico y México. La edición 2026 se celebró en Caracas.",
      fi: new Date("2026-01-30"),
      ff: new Date("2026-02-07"),
      te: "Deportivo",
      dest: "Caracas",
    },
    // Llanos
    {
      nom: "Festival del Joropo",
      des: "Encuentro internacional de música y baile llanero.",
      fi: addDays(today, 40),
      ff: addDays(today, 44),
      te: "Cultural",
      dest: "San Fernando de Apure",
    },
    {
      nom: "Exposición Agropecuaria de Barinas",
      des: "Feria agropecuaria con muestras de ganado, artesanía y eventos ecuestres.",
      fi: addDays(today, 80),
      ff: addDays(today, 87),
      te: "Feria",
      dest: "Santuario de la Virgen de Coromoto",
    },
    {
      nom: "Ferias de Elorza",
      des: "Tradicional feria del oriente apureño con coleo, toros coleados, bailes de joropo, artesanía y la mejor gastronomía llanera. Se celebra anualmente en marzo.",
      fi: addDays(today, 256),
      ff: addDays(today, 258),
      te: "Cultural",
      dest: "San Fernando de Apure",
    },
    // Amazonía
    {
      nom: "Encuentro Indígena del Orinoco",
      des: "Celebración de los pueblos originarios con artesanía y música ancestral.",
      fi: addDays(today, 70),
      ff: addDays(today, 74),
      te: "Cultural",
      dest: "Puerto Ayacucho",
    },
    {
      nom: "Feria del Orinoco",
      des: "Feria gastronómica del río Orinoco en Ciudad Bolívar, con platos típicos de la pesca fluvial y productos locales.",
      fi: addDays(today, 130),
      ff: addDays(today, 132),
      te: "Gastronómico",
      dest: "Ciudad Bolívar",
    },
    // Insular
    {
      nom: "Procesión Marítima de la Virgen del Valle",
      des: "Tradicional procesión marítima en honor a la Virgen del Valle, patrona de oriente y de la Armada Venezolana. Embarcaciones engalanadas recorren las costas de Margarita cada 8 de septiembre.",
      fi: addDays(today, 68),
      ff: addDays(today, 68),
      te: "Religioso",
      dest: "Playa El Agua",
    },
    {
      nom: "Margarita Gastronómica",
      des: "Feria gourmet de pescados, mariscos y postres típicos de Margarita, acompañada de música local.",
      fi: addDays(today, 85),
      ff: addDays(today, 88),
      te: "Gastronómico",
      dest: "Castillo de la Galera",
    },
    // Oriental
    {
      nom: "Carnavales de El Callao",
      des: "Patrimonio Cultural Inmaterial de la UNESCO: calipso y madamas.",
      fi: new Date("2026-02-12"),
      ff: new Date("2026-02-17"),
      te: "Cultural",
      dest: "Parque Nacional Canaima",
    },
    {
      nom: "Festival del Mar",
      des: "Celebración costera con deportes acuáticos y gastronomía marina.",
      fi: addDays(today, 65),
      ff: addDays(today, 68),
      te: "Cultural",
      dest: "Parque Nacional Mochima",
    },
  ];

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  for (const e of eventosData) {
    await prisma.tM_EVENT.create({
      data: {
        EVEN_NOM: e.nom,
        EVEN_DES: e.des,
        EVEN_FI: e.fi,
        EVEN_FF: e.ff,
        EVEN_TE: tiposEvento[e.te],
        EVEN_DI: destinos[e.dest],
        EVEN_IMG: EVEN_IMG_MAP[e.nom] || null,
      },
    });
  }
  console.log(`  ✔ ${eventosData.length} eventos creados`);

  // =============================================
  // 14. OPINIONES
  // =============================================
  const opinionesData = [
    { cal: 5, com: "Increíble experiencia, el Salto Ángel es imponente. Los guías fueron muy profesionales.", feo: addDays(today, -30), usu: adminUser.USUA_COD, des: "Parque Nacional Canaima" },
    { cal: 4, com: "Hermosas playas de arena blanca, el agua cristalina es perfecta para snorkel.", feo: addDays(today, -45), usu: adminUser.USUA_COD, des: "Archipiélago Los Roques" },
    { cal: 5, com: "El teleférico más alto del mundo, vistas espectaculares. Imperdible.", feo: addDays(today, -60), usu: adminUser.USUA_COD, des: "Pico Bolívar" },
    { cal: 4, com: "Excelente destino para conocer la cultura andina. La gastronomía es deliciosa.", feo: addDays(today, -20), usu: adminUser.USUA_COD, des: "San Pedro del Río" },
    { cal: 3, com: "Interesante formación natural, pero necesitan mejorar el acceso y la señalización.", feo: addDays(today, -15), usu: adminUser.USUA_COD, des: "Médanos de Coro" },
    { cal: 5, com: "La gastronomía llanera es única, el restaurante Doña Bárbara ofrece los mejores pisillos.", feo: addDays(today, -40), usu: adminUser.USUA_COD, des: "San Fernando de Apure" },
    { cal: 4, com: "El pueblo alemán más hermoso de Venezuela, la comida y el clima son perfectos.", feo: addDays(today, -10), usu: adminUser.USUA_COD, des: "Colonia Tovar" },
    { cal: 5, com: "Amanecer en el Roraima es una experiencia que cambia la vida.", feo: addDays(today, -90), usu: adminUser.USUA_COD, des: "Monte Roraima" },
    { cal: 4, com: "Margarita siempre sorprende. Playa El Agua es perfecta para familias.", feo: addDays(today, -25), usu: adminUser.USUA_COD, des: "Playa El Agua" },
  ];

  for (const o of opinionesData) {
    await prisma.tM_OPINI.create({
      data: {
        RECO_CAL: o.cal,
        RECO_COM: o.com,
        RECO_FEO: o.feo,
        RECO_USU: o.usu,
        RECO_DES: destinos[o.des],
      },
    });
  }
  console.log(`  ✔ ${opinionesData.length} opiniones creadas`);

  // =============================================
  // 15. CONSULTAS
  // =============================================
  const consultasData = [
    { con: "Buenos días, quisiera saber los requisitos para registrar un hotel en la plataforma COTATUR. ¿Qué documentos necesito presentar?", can: "web", est: "pendiente", usu: null },
    { con: "Hola, soy guía turístico certificado y quiero actualizar mi información de contacto en el directorio. ¿Puedo hacerlo en línea?", can: "web", est: "respondida", res: "Estimado usuario, puede actualizar sus datos ingresando a su perfil en la plataforma. Saludos cordiales.", usu: null },
    { con: "Saludos, necesito reportar que la información del destino Médanos de Coro tiene errores en los horarios de visita.", can: "email", est: "pendiente", usu: null },
    { con: "Estoy interesado en promocionar mi restaurante en la plataforma. ¿Hay algún costo asociado al registro?", can: "web", est: "respondida", res: "Hola, el registro de proveedores en COTATUR es completamente gratuito. Solo debe completar el formulario y esperar la validación. Saludos.", usu: null },
    { con: "Buenas tardes, no puedo acceder a mi cuenta de usuario. He intentado recuperar mi contraseña pero no recibo el correo.", can: "email", est: "pendiente", usu: null },
    { con: "Quisiera saber si tienen información sobre las rutas turísticas disponibles en el estado Bolívar y cómo contratar un guía local.", can: "web", est: "pendiente", usu: null },
  ];

  for (const c of consultasData) {
    await prisma.tM_CONSU.create({
      data: {
        CONS_CON: c.con,
        CONS_CAN: c.can,
        CONS_EST: c.est,
        CONS_RES: c.res || null,
        CONS_USU: c.usu || null,
      },
    });
  }
  console.log(`  ✔ ${consultasData.length} consultas creadas`);

  // =============================================
  // 16. CONTENIDO INSTITUCIONAL
  // =============================================
  const coinsData = [
    { tit: "Plan Nacional de Turismo Sostenible 2026", tco: "noticia", des: "El MINTUR presenta el Plan Nacional de Turismo Sostenible 2026, una hoja de ruta para el desarrollo turístico del país con énfasis en la sustentabilidad ambiental.", url: "", fpu: addDays(today, -30) },
    { tit: "Campaña 'Venezuela es tu Destino'", tco: "noticia", des: "La campaña internacional de promoción turística ha alcanzado más de 10 millones de impresiones en redes sociales.", url: "", fpu: addDays(today, -15) },
    { tit: "Comunicado: Actualización de requisitos para prestadores", tco: "comunicado", des: "A partir del 1 de julio de 2026 entrarán en vigencia los nuevos requisitos para la actualización del Registro Turístico Nacional.", url: "", fpu: addDays(today, -5) },
    { tit: "Horarios de atención al público", tco: "comunicado", des: "Atención al público de lunes a viernes de 8:00 AM a 4:00 PM, sábados de 9:00 AM a 12:00 PM.", url: "", fpu: addDays(today, -60) },
  ];

  for (const c of coinsData) {
    await prisma.tM_COINS.create({
      data: {
        CINS_TIT: c.tit,
        CINS_TCO: c.tco,
        CINS_DES: c.des,
        CINS_URL: c.url,
        CINS_FPU: c.fpu,
        CINS_AUT: adminUser.USUA_COD,
      },
    });
  }
  console.log(`  ✔ ${coinsData.length} contenidos institucionales creados`);

  // =============================================
  // 17. CONTENIDO TURÍSTICO
  // =============================================
  const coturData = [
    { tit: "Guía de Viaje: Parque Nacional Canaima", tco: "guia", des: "Todo lo que necesitas saber para visitar el Parque Nacional Canaima, incluyendo rutas, hospedaje y recomendaciones.", url: "", dest: "Parque Nacional Canaima" },
    { tit: "Ficha Destino: Archipiélago Los Roques", tco: "ficha", des: "Información detallada del Archipiélago Los Roques: cómo llegar, mejores épocas y actividades.", url: "", dest: "Archipiélago Los Roques" },
    { tit: "Gastronomía de los Llanos", tco: "articulo", des: "Los platos típicos llaneros que no puedes dejar de probar: pisillo, hervido de gallina y carne en vara.", url: "", dest: "San Fernando de Apure" },
    { tit: "Ficha Destino: Pico Bolívar", tco: "ficha", des: "Información sobre el Pico Bolívar, la montaña más alta de Venezuela con 4.978 msnm.", url: "", dest: "Pico Bolívar" },
  ];

  for (const c of coturData) {
    await prisma.tM_COTUR.create({
      data: {
        CTUR_TIT: c.tit,
        CTUR_TCO: c.tco,
        CTUR_DES: c.des,
        CTUR_URL: c.url,
        CTUR_FPU: addDays(today, -10),
        CTUR_AUT: adminUser.USUA_COD,
        CTUR_DET: destinos[c.dest],
      },
    });
  }
  console.log(`  ✔ ${coturData.length} contenidos turísticos creados`);

  console.log("\n✅ Seed completado exitosamente!");
  console.log("   Usuario admin: admin@cotatur.gob.ve / cotatur2026");
  console.log("   Usuario demo: prestador@correo.com / cotatur2026");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
