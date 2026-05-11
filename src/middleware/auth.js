const { env } = require('../config/env');
const { ensureUser, getUserById } = require('../repositories/storeRepository');
const { verifyToken } = require('../auth/token');

async function requireAuth(req, res, next) {
  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.sub) {
      const user = await getUserById(payload.sub);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  if (env.enableDevAuth && env.nodeEnv !== 'production') {
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
