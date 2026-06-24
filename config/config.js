const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port:        process.env.PORT        || 5000,
  nodeEnv:     process.env.NODE_ENV    || 'development',
  clientUrl:   process.env.CLIENT_URL  || 'http://localhost:3000',
  jwtSecret:   process.env.JWT_SECRET  || 'fallback_secret_change_this',
  jwtExpire:   process.env.JWT_EXPIRE  || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};
