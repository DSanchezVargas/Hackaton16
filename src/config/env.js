const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret',
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'hackathon16',
  },
  github: {
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL:
      process.env.GITHUB_CALLBACK_URL ||
      'http://localhost:3000/auth/github/callback',
  },
  frontendSuccessUrl: process.env.FRONTEND_SUCCESS_URL || '/auth/success',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  culqiSecretKey: process.env.CULQI_SECRET_KEY || '',
  culqiApiUrl: process.env.CULQI_API_URL || 'https://api.culqi.com/v2',
  enableDevAuth: String(process.env.ENABLE_DEV_AUTH || 'false') === 'true',
};

module.exports = { env };
