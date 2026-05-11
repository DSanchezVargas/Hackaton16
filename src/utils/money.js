function calculateAmountCents(priceCents, quantity) {
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    throw new Error('Invalid price');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid quantity');
  }
  const total = priceCents * quantity;
  if (!Number.isSafeInteger(total)) {
    throw new Error('Amount exceeds safe integer range');
  }
  return total;
}

module.exports = { calculateAmountCents };
