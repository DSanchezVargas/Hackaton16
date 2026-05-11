const { env } = require('../../config/env');

async function culqiRequest(path, payload) {
  const response = await fetch(`${env.culqiApiUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.culqiSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Culqi API error: ${response.status}`);
  }

  return response.json();
}

async function createCulqiPayment({ amountCents, currency, token, email }) {
  if (!env.culqiSecretKey) {
    return {
      providerPaymentId: `test_culqi_${Date.now()}`,
      status: 'simulated',
    };
  }

  const data = await culqiRequest('/charges', {
    amount: amountCents,
    currency_code: currency,
    source_id: token,
    description: 'Hackathon16 online payment',
    email: email || 'customer@example.com',
  });

  return {
    providerPaymentId: data.id,
    status: data.outcome?.type || 'succeeded',
  };
}

async function createCulqiRefund({ providerPaymentId, amountCents, reason }) {
  if (!env.culqiSecretKey) {
    return {
      providerRefundId: `test_culqi_ref_${Date.now()}`,
      status: 'simulated',
    };
  }

  const data = await culqiRequest('/refunds', {
    amount: amountCents,
    charge_id: providerPaymentId,
    reason: reason || 'requested_by_customer',
  });

  return {
    providerRefundId: data.id,
    status: data.status || 'pending',
  };
}

module.exports = {
  createCulqiPayment,
  createCulqiRefund,
};
