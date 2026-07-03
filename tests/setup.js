require('dotenv').config({ path: '.env.example' });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_67890';
process.env.MAIL_USER = 'test@cotatur.gob.ve';
process.env.MAIL_PASS = 'test_app_password';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.CORS_ORIGINS = 'http://localhost:5173';

jest.mock('../src/config/database', () => {
  const mockFn = () => jest.fn();
  const mockModel = (methods) => {
    const obj = {};
    methods.forEach(m => { obj[m] = jest.fn(); });
    return obj;
  };

  return {
    tM_PAISE: mockModel(['findMany', 'findUnique']),
    tM_REGION: mockModel(['findMany']),
    tM_CORPO: mockModel(['findMany']),
    tM_ESTADO: mockModel(['findMany']),
    tM_MUNIC: mockModel(['findMany']),
    tM_PARRO: mockModel(['findMany']),
    tM_ROLES: mockModel(['findMany', 'findUnique']),
    tM_USUAR: mockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
    tM_TITUR: mockModel(['findMany']),
    tM_TIEVE: mockModel(['findMany']),
    tM_DESTI: mockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
    tM_RUTAT: mockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
    tM_PRSER: mockModel(['findUnique', 'findFirst', 'findMany', 'create', 'update', 'delete', 'count']),
    tM_EVENT: mockModel(['findUnique', 'findMany', 'create', 'update', 'delete', 'count']),
    tM_CONSU: mockModel(['findUnique', 'findMany', 'create', 'update', 'count']),
    tM_OPINI: mockModel(['findMany', 'create', 'delete', 'count']),
    tM_COINS: mockModel(['findMany', 'create', 'update', 'delete', 'count']),
    tM_COTUR: mockModel(['findMany', 'create', 'update', 'delete', 'count']),
    tR_USU_REGI: mockModel(['findMany']),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
});

jest.mock('../src/config/mailer', () => ({
  transporter: {
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  },
  verifyMailConnection: jest.fn().mockResolvedValue(undefined),
}));
