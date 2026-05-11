const { env } = require('../config/env');
const { ensureUser } = require('../repositories/storeRepository');

async function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  if (env.enableDevAuth) {
    const fallbackId = req.header('x-dev-user-id') || 'dev-user';
    const fallbackUsername = req.header('x-dev-username') || 'dev';
    req.user = await ensureUser({
      provider: 'dev',
      oauthId: fallbackId,
      username: fallbackUsername,
    });
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { requireAuth };
