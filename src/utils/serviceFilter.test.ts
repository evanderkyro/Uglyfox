import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSortServices, type ServiceRecord } from './serviceFilter';

const SERVICES: ServiceRecord[] = [
  {
    id: 1n,
    provider: '0x1111111111111111111111111111111111111111',
    name: 'Vector Search API',
    description: 'Low latency embeddings lookup',
    pricePerCall: 2_000n,
    token: '0x3600000000000000000000000000000000000000',
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
    active: true,
    totalCalls: 40n,
  },
  {
    id: 2n,
    provider: '0x2222222222222222222222222222222222222222',
    name: 'Euro FX Oracle',
    description: 'Real time FX feed settled in EURC',
    pricePerCall: 10_000n,
    token: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
    tokenSymbol: 'EURC',
    tokenDecimals: 6,
    active: true,
    totalCalls: 120n,
  },
];

test('filterAndSortServices filters by token and search query', () => {
  const eurcOnly = filterAndSortServices(SERVICES, '', 'EURC', 'newest');
  assert.equal(eurcOnly.length, 1);
  assert.equal(eurcOnly[0].id, 2n);

  const searchHit = filterAndSortServices(SERVICES, 'embeddings', 'ALL', 'newest');
  assert.equal(searchHit.length, 1);
  assert.equal(searchHit[0].id, 1n);
});

test('filterAndSortServices sorts by price and call volume', () => {
  const priceAsc = filterAndSortServices(SERVICES, '', 'ALL', 'price_asc');
  assert.equal(priceAsc[0].id, 1n);

  const callsDesc = filterAndSortServices(SERVICES, '', 'ALL', 'calls_desc');
  assert.equal(callsDesc[0].id, 2n);
});
