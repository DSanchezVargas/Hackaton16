const { pool } = require('../db/pool');

async function ensureUser({ provider, oauthId, username }) {
  await pool.execute(
    `INSERT INTO users (oauth_provider, oauth_id, username)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE username = VALUES(username)`,
    [provider, oauthId, username]
  );

  const [rows] = await pool.execute(
    'SELECT id, oauth_provider, oauth_id, username FROM users WHERE oauth_provider = ? AND oauth_id = ? LIMIT 1',
    [provider, oauthId]
  );

  return rows[0] || null;
}

async function getUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, oauth_provider, oauth_id, username FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createProduct({ name, description, priceCents, currency }) {
  const [result] = await pool.execute(
    'INSERT INTO products (name, description, price_cents, currency) VALUES (?, ?, ?, ?)',
    [name, description, priceCents, currency]
  );
  return getProductById(result.insertId);
}

async function listProducts() {
  const [rows] = await pool.execute(
    'SELECT id, name, description, price_cents, currency, created_at FROM products ORDER BY id DESC'
  );
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, description, price_cents, currency, created_at FROM products WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createPayment({
  userId,
  productId,
  quantity,
  amountCents,
  currency,
  provider,
  providerPaymentId,
  status,
}) {
  const [result] = await pool.execute(
    `INSERT INTO payments
      (user_id, product_id, quantity, amount_cents, currency, provider, provider_payment_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      productId,
      quantity,
      amountCents,
      currency,
      provider,
      providerPaymentId,
      status,
    ]
  );
  return getPaymentById(result.insertId);
}

async function getPaymentById(id) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.user_id, u.username, p.product_id, pr.name AS product_name, p.quantity,
            p.amount_cents, p.currency, p.provider, p.provider_payment_id, p.status, p.created_at
     FROM payments p
     INNER JOIN users u ON u.id = p.user_id
     INNER JOIN products pr ON pr.id = p.product_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function listPaymentsByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.product_id, pr.name AS product_name, p.quantity, p.amount_cents, p.currency,
            p.provider, p.provider_payment_id, p.status, p.created_at
     FROM payments p
     INNER JOIN products pr ON pr.id = p.product_id
     WHERE p.user_id = ?
     ORDER BY p.id DESC`,
    [userId]
  );
  return rows;
}

async function createRefund({
  paymentId,
  amountCents,
  reason,
  providerRefundId,
  status,
}) {
  const [result] = await pool.execute(
    `INSERT INTO refunds
      (payment_id, amount_cents, reason, provider_refund_id, status)
      VALUES (?, ?, ?, ?, ?)`,
    [paymentId, amountCents, reason, providerRefundId, status]
  );
  return getRefundById(result.insertId);
}

async function getRefundById(id) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.payment_id, r.amount_cents, r.reason, r.provider_refund_id, r.status, r.created_at
     FROM refunds r
     WHERE r.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function listRefundsByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.payment_id, r.amount_cents, r.reason, r.provider_refund_id, r.status, r.created_at
     FROM refunds r
     INNER JOIN payments p ON p.id = r.payment_id
     WHERE p.user_id = ?
     ORDER BY r.id DESC`,
    [userId]
  );
  return rows;
}

async function updatePaymentStatus(paymentId, status) {
  await pool.execute('UPDATE payments SET status = ? WHERE id = ?', [
    status,
    paymentId,
  ]);
}

module.exports = {
  ensureUser,
  getUserById,
  createProduct,
  getProductById,
  listProducts,
  createPayment,
  getPaymentById,
  listPaymentsByUser,
  createRefund,
  getRefundById,
  listRefundsByUser,
  updatePaymentStatus,
};
