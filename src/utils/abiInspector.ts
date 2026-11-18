export interface AbiParameter {
  name?: string;
  type: string;
  components?: AbiParameter[];
}

export interface AbiFunctionEntry {
  type: string;
  name?: string;
  inputs?: AbiParameter[];
  outputs?: AbiParameter[];
  stateMutability?: string;
}

export type UglyfoxOperation =
  | 'registerService'
  | 'updateService'
  | 'topUp'
  | 'withdraw'
  | 'recordUsage'
  | 'claimEarnings'
  | 'getAllServices'
  | 'getService'
  | 'serviceCount'
  | 'getBalance'
  | 'getUsage'
  | 'getProviderEarnings'
  | 'getPlatformStats';

const OPERATION_CANDIDATES: Record<UglyfoxOperation, string[]> = {
  registerService: ['registerService', 'createService', 'listService', 'addService'],
  updateService: ['updateService', 'editService', 'setService'],
  topUp: ['topUp', 'deposit', 'fundBalance', 'addBalance'],
  withdraw: ['withdraw', 'withdrawBalance', 'withdrawUnused'],
  recordUsage: ['recordUsage', 'meterUsage', 'chargeUsage', 'logUsage', 'deductUsage'],
  claimEarnings: ['claimEarnings', 'claim', 'withdrawEarnings', 'claimProviderEarnings'],
  getAllServices: ['getAllServices', 'getServices', 'listServices', 'allServices'],
  getService: ['getService', 'services', 'serviceById'],
  serviceCount: ['serviceCount', 'getServiceCount', 'totalServices', 'nextServiceId'],
  getBalance: ['getBalance', 'balanceOf', 'balances', 'prepaidBalance', 'userBalance'],
  getUsage: ['getUsage', 'getUserUsage', 'usage', 'userServiceUsage', 'callsUsed'],
  getProviderEarnings: [
    'getProviderEarnings',
    'providerEarnings',
    'claimableEarnings',
    'earnings',
  ],
  getPlatformStats: ['getPlatformStats', 'platformStats', 'getStats', 'stats'],
};

export function findAbiFunction(
  abi: readonly AbiFunctionEntry[],
  operation: UglyfoxOperation
): AbiFunctionEntry | null {
  const functions = abi.filter(
    (item): item is AbiFunctionEntry & { name: string } =>
      item.type === 'function' && typeof item.name === 'string'
  );

  const candidates = OPERATION_CANDIDATES[operation];
  for (const candidate of candidates) {
    const exact = functions.find((fn) => fn.name === candidate);
    if (exact) return exact;
  }

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const insensitive = functions.find((fn) => fn.name.toLowerCase() === lower);
    if (insensitive) return insensitive;
  }

  return null;
}

export function resolveAbiCapabilities(
  abi: readonly AbiFunctionEntry[]
): Record<UglyfoxOperation, string | null> {
  const operations = Object.keys(OPERATION_CANDIDATES) as UglyfoxOperation[];
  const result = {} as Record<UglyfoxOperation, string | null>;
  for (const op of operations) {
    result[op] = findAbiFunction(abi, op)?.name ?? null;
  }
  return result;
}

export function needsApproval(allowance: bigint, requiredAmount: bigint): boolean {
  if (requiredAmount <= 0n) return false;
  return allowance < requiredAmount;
}

export function computeEstimatedCalls(balance: bigint, pricePerCall: bigint): bigint {
  if (balance <= 0n || pricePerCall <= 0n) return 0n;
  return balance / pricePerCall;
}
