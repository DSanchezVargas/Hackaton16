const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateAmountCents } = require('../src/utils/money');

test('calculateAmountCents returns total amount', () => {
  assert.equal(calculateAmountCents(1999, 3), 5997);
});

test('calculateAmountCents validates price', () => {
  assert.throws(() => calculateAmountCents(0, 1), /Invalid price/);
});

test('calculateAmountCents validates quantity', () => {
  assert.throws(() => calculateAmountCents(1000, 0), /Invalid quantity/);
});

test('calculateAmountCents stays within safe integer range', () => {
  assert.throws(
    () => calculateAmountCents(1000000000, 1000000000),
    /safe integer range/
  );
});
