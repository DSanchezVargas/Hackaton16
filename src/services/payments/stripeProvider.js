const Stripe = require('stripe');
const { env } = require('../../config/env');

const stripeClient = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey)
  : null;

async function createStripePayment({ amountCents, currency, token }) {
  if (!stripeClient) {
    return {
      providerPaymentId: `test_stripe_${Date.now()}`,
      status: 'simulated',
    };
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    payment_method_data: {
      type: 'card',
      card: { token },
    },
    confirm: true,
    automatic_payment_methods: { enabled: false },
  });

  return {
    providerPaymentId: paymentIntent.id,
    status: paymentIntent.status,
  };
}

async function createStripeRefund({ providerPaymentId }) {
  if (!stripeClient) {
    return {
      providerRefundId: `test_stripe_ref_${Date.now()}`,
      status: 'simulated',
    };
  }

  const refund = await stripeClient.refunds.create({
    payment_intent: providerPaymentId,
  });

  return {
    providerRefundId: refund.id,
    status: refund.status,
  };
}

module.exports = {
  createStripePayment,
  createStripeRefund,
};
