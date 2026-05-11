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
    const errorBody = await response.text();
    throw new Error(`Culqi API error: ${response.status} ${errorBody}`);
  }

  return response.json();
}

async function createCulqiPayment({ amountCents, currency, token }) {
  if (!env.culqiSecretKey) {
    return {
      providerPaymentId: `culqi_sim_${Date.now()}`,
      status: 'simulated',
    };
  }

  const data = await culqiRequest('/charges', {
    amount: amountCents,
    currency_code: currency,
    source_id: token,
    description: 'Hackathon16 online payment',
    email: 'customer@example.com',
  });

  return {
    providerPaymentId: data.id,
    status: data.outcome?.type || 'succeeded',
  };
}

async function createCulqiRefund({ providerPaymentId, amountCents, reason }) {
  if (!env.culqiSecretKey) {
    return {
      providerRefundId: `culqi_ref_sim_${Date.now()}`,
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
