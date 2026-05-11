function calculateAmountCents(priceCents, quantity) {
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    throw new Error('Invalid price');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid quantity');
  }
  return priceCents * quantity;
}

module.exports = { calculateAmountCents };
