import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEstimatedCalls,
  findAbiFunction,
  needsApproval,
  resolveAbiCapabilities,
} from './abiInspector';

const SAMPLE_DEPLOYED_ABI = [
  {
    type: 'function',
    name: 'createService',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'pricePerCall', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'deposit',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'recordUsage',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'serviceId', type: 'uint256' },
      { name: 'user', type: 'address' },
      { name: 'calls', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimEarnings',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getAllServices',
    stateMutability: 'view',
    inputs: [],
    outputs: [],
  },
];

test('findAbiFunction resolves alternative deployed method signatures dynamically', () => {
  assert.equal(findAbiFunction(SAMPLE_DEPLOYED_ABI, 'registerService')?.name, 'createService');
  assert.equal(findAbiFunction(SAMPLE_DEPLOYED_ABI, 'topUp')?.name, 'deposit');
  assert.equal(findAbiFunction(SAMPLE_DEPLOYED_ABI, 'getUsage'), null);

  const caps = resolveAbiCapabilities(SAMPLE_DEPLOYED_ABI);
  assert.equal(caps.registerService, 'createService');
  assert.equal(caps.topUp, 'deposit');
  assert.equal(caps.claimEarnings, 'claimEarnings');
});

test('needsApproval checks allowance threshold strictly', () => {
  assert.equal(needsApproval(0n, 100n), true);
  assert.equal(needsApproval(99n, 100n), true);
  assert.equal(needsApproval(100n, 100n), false);
  assert.equal(needsApproval(0n, 0n), false);
});

test('computeEstimatedCalls divides prepaid balance safely', () => {
  assert.equal(computeEstimatedCalls(10_000_000n, 5_000n), 2000n);
  assert.equal(computeEstimatedCalls(10_000_000n, 0n), 0n);
  assert.equal(computeEstimatedCalls(0n, 5_000n), 0n);
});
