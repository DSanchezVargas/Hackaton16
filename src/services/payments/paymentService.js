const {
  createStripePayment,
  createStripeRefund,
} = require('./stripeProvider');
const {
  createCulqiPayment,
  createCulqiRefund,
} = require('./culqiProvider');

async function createExternalPayment({ provider, amountCents, currency, token }) {
  if (provider === 'stripe') {
    return createStripePayment({ amountCents, currency, token });
  }

  if (provider === 'culqi') {
    return createCulqiPayment({ amountCents, currency, token });
  }

  throw new Error('Unsupported payment provider');
}

async function createExternalRefund({
  provider,
  providerPaymentId,
  amountCents,
  reason,
}) {
  if (provider === 'stripe') {
    return createStripeRefund({ providerPaymentId });
  }

  if (provider === 'culqi') {
    return createCulqiRefund({ providerPaymentId, amountCents, reason });
  }

  throw new Error('Unsupported payment provider');
}

module.exports = {
  createExternalPayment,
  createExternalRefund,
};
