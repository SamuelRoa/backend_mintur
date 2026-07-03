const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const r1 = await p.tM_ROLES.upsert({
      where: { ROLE_NOM: 'Gestor Turístico' },
      update: {},
      create: { ROLE_NOM: 'Gestor Turístico', ROLE_DES: 'Gestiona oferta turística (panel limitado)' }
    });
    console.log('Gestor Turístico -> ID:', r1.ROLE_COD);

    const r2 = await p.tM_ROLES.upsert({
      where: { ROLE_NOM: 'Prestador Servicio' },
      update: {},
      create: { ROLE_NOM: 'Prestador Servicio', ROLE_DES: 'Prestador registrado desde website' }
    });
    console.log('Prestador Servicio -> ID:', r2.ROLE_COD);

    console.log('Roles creados exitosamente.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
})();
