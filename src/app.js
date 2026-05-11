const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const { env } = require('./config/env');
const { passport } = require('./auth/passport');
const { requireAuth } = require('./middleware/auth');
const {
  createProduct,
  getProductById,
  listProducts,
  createPayment,
  getPaymentById,
  listPaymentsByUser,
  createRefund,
  listRefundsByUser,
  updatePaymentStatus,
} = require('./repositories/storeRepository');
const {
  createExternalPayment,
  createExternalRefund,
} = require('./services/payments/paymentService');
const { toHttpError } = require('./utils/http');
const { calculateAmountCents } = require('./utils/money');

function createApp() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  app.use(express.json());
  app.use(
    session({
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/auth/github', (req, res, next) => {
    if (!env.github.clientID || !env.github.clientSecret) {
      return res.status(503).json({ error: 'GitHub OAuth is not configured' });
    }
    return passport.authenticate('github', { scope: ['user:email'] })(
      req,
      res,
      next
    );
  });

  app.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/failure' }),
    (_req, res) => {
      res.redirect(env.frontendSuccessUrl);
    }
  );

  app.get('/auth/success', requireAuth, (req, res) => {
    res.json({ user: req.user });
  });

  app.get('/auth/failure', (_req, res) => {
    res.status(401).json({ error: 'OAuth authentication failed' });
  });

  app.post('/api/products', requireAuth, async (req, res) => {
    try {
      const { name, description = '', priceCents, currency = 'PEN' } = req.body;
      if (!name || !Number.isInteger(priceCents) || priceCents <= 0) {
        return res.status(400).json({ error: 'Invalid product payload' });
      }

      const product = await createProduct({
        name,
        description,
        priceCents,
        currency,
      });
      return res.status(201).json(product);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  app.get('/api/products', async (_req, res) => {
    try {
      const products = await listProducts();
      return res.json(products);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  app.post('/api/payments', requireAuth, async (req, res) => {
    try {
      const { productId, quantity, provider, token } = req.body;

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !['stripe', 'culqi'].includes(provider)
      ) {
        return res.status(400).json({ error: 'Invalid payment payload' });
      }

      const product = await getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const amountCents = calculateAmountCents(product.price_cents, quantity);
      const providerResponse = await createExternalPayment({
        provider,
        amountCents,
        currency: product.currency,
        token,
      });

      const payment = await createPayment({
        userId: req.user.id,
        productId,
        quantity,
        amountCents,
        currency: product.currency,
        provider,
        providerPaymentId: providerResponse.providerPaymentId,
        status: providerResponse.status,
      });

      io.emit('payment:created', payment);
      return res.status(201).json(payment);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  app.get('/api/payments', requireAuth, async (req, res) => {
    try {
      const payments = await listPaymentsByUser(req.user.id);
      return res.json(payments);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  app.post('/api/refunds', requireAuth, async (req, res) => {
    try {
      const { paymentId, reason = 'requested_by_customer' } = req.body;
      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({ error: 'Invalid refund payload' });
      }

      const payment = await getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      if (payment.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Payment does not belong to user' });
      }

      const providerResponse = await createExternalRefund({
        provider: payment.provider,
        providerPaymentId: payment.provider_payment_id,
        amountCents: payment.amount_cents,
        reason,
      });

      const refund = await createRefund({
        paymentId,
        amountCents: payment.amount_cents,
        reason,
        providerRefundId: providerResponse.providerRefundId,
        status: providerResponse.status,
      });

      await updatePaymentStatus(paymentId, 'refunded');
      io.emit('refund:created', refund);
      return res.status(201).json(refund);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  app.get('/api/refunds', requireAuth, async (req, res) => {
    try {
      const refunds = await listRefundsByUser(req.user.id);
      return res.json(refunds);
    } catch (error) {
      return res.status(500).json(toHttpError(error));
    }
  });

  return { app, server };
}

module.exports = { createApp };
