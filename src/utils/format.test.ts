import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatExactTokenAmount,
  formatIntegerCount,
  formatTokenAmount,
  parseTokenAmountSafe,
  truncateAddress,
  validateAmountInput,
} from './format';

test('parseTokenAmountSafe parses 6-decimal USDC amounts accurately without float drift', () => {
  assert.equal(parseTokenAmountSafe('10.5', 6), 10_500_000n);
  assert.equal(parseTokenAmountSafe('0.000001', 6), 1n);
  assert.equal(parseTokenAmountSafe('1,250.25', 6), 1_250_250_000n);
  assert.equal(parseTokenAmountSafe('0.0000001', 6), null);
  assert.equal(parseTokenAmountSafe('-5', 6), null);
  assert.equal(parseTokenAmountSafe('abc', 6), null);
});

test('formatTokenAmount formats 6-decimal and 18-decimal values cleanly', () => {
  assert.equal(formatTokenAmount(0n, 6), '0.00');
  assert.equal(formatTokenAmount(10_500_000n, 6), '10.50');
  assert.equal(formatTokenAmount(5_000n, 6), '0.005');
  assert.equal(formatTokenAmount(1_250_000_000n, 6), '1,250.00');
  assert.equal(formatExactTokenAmount(1_000_001n, 6), '1.000001');
});

test('validateAmountInput enforces positive values and balance ceiling', () => {
  assert.equal(validateAmountInput('', 6), 'Enter an amount');
  assert.equal(validateAmountInput('0', 6), 'Amount must be greater than zero');
  assert.equal(validateAmountInput('12', 6, 10_000_000n), 'Amount exceeds available balance');
  assert.equal(validateAmountInput('5.5', 6, 10_000_000n), null);
});

test('truncateAddress and formatIntegerCount format identifiers cleanly', () => {
  assert.equal(
    truncateAddress('0x3600000000000000000000000000000000000000'),
    '0x3600...0000'
  );
  assert.equal(formatIntegerCount(1234567n), '1,234,567');
});
