const crypto = require('crypto');
const { env } = require('../config/env');

function toBase64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  };

  const payloadText = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(payloadText);
  const signature = crypto
    .createHmac('sha256', env.sessionSecret)
    .update(payloadEncoded)
    .digest('base64url');

  return `${payloadEncoded}.${signature}`;
}

function verifyToken(token) {
  try {
    const [payloadEncoded, providedSignature] = (token || '').split('.');
  if (!payloadEncoded || !providedSignature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.sessionSecret)
    .update(payloadEncoded)
    .digest('base64url');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(providedSignature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadEncoded));
  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
  } catch (_error) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
