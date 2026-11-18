import { erc20Abi, type Abi, type Address } from 'viem';
import { ARC_EXPLORER_URL } from '../config/arc';
import type { AbiFunctionEntry } from '../utils/abiInspector';

export { erc20Abi };

export const CANONICAL_UGLYFOX_ABI = [
  {
    type: 'function',
    name: 'registerService',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'pricePerCall', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: 'serviceId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'updateService',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'serviceId', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'pricePerCall', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'active', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'topUp',
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
      { name: 'consumer', type: 'address' },
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
    name: 'serviceCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getService',
    stateMutability: 'view',
    inputs: [{ name: 'serviceId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'provider', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'pricePerCall', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'active', type: 'bool' },
          { name: 'totalCalls', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getAllServices',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'provider', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'pricePerCall', type: 'uint256' },
          { name: 'token', type: 'address' },
          { name: 'active', type: 'bool' },
          { name: 'totalCalls', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getBalance',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getUsage',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'serviceId', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getProviderEarnings',
    stateMutability: 'view',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getPlatformStats',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'totalServices', type: 'uint256' },
      { name: 'totalCalls', type: 'uint256' },
      { name: 'totalUsdcVolume', type: 'uint256' },
      { name: 'totalEurcVolume', type: 'uint256' },
    ],
  },
] as const satisfies Abi;

export interface ResolvedAbiResult {
  abi: Abi;
  source: 'explorer' | 'unconfigured';
}

export async function fetchDeployedContractAbi(
  contractAddress: Address | null
): Promise<ResolvedAbiResult> {
  if (!contractAddress) {
    return {
      abi: CANONICAL_UGLYFOX_ABI,
      source: 'unconfigured',
    };
  }

  try {
    const res = await fetch(
      `${ARC_EXPLORER_URL}/api?module=contract&action=getabi&address=${contractAddress}`
    );
    if (res.ok) {
      const json = (await res.json()) as { status?: string; result?: string };
      if (json.status === '1' && json.result) {
        const parsed = JSON.parse(json.result) as AbiFunctionEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            abi: parsed as unknown as Abi,
            source: 'explorer',
          };
        }
      }
    }
  } catch {
    // Fall through to Blockscout v2 endpoint
  }

  try {
    const v2Res = await fetch(`${ARC_EXPLORER_URL}/api/v2/smart-contracts/${contractAddress}`);
    if (v2Res.ok) {
      const json = (await v2Res.json()) as { abi?: AbiFunctionEntry[] };
      if (Array.isArray(json.abi) && json.abi.length > 0) {
        return {
          abi: json.abi as unknown as Abi,
          source: 'explorer',
        };
      }
    }
  } catch {
    // Contract may be unverified; use canonical ABI fallback while address is active
  }

  return {
    abi: CANONICAL_UGLYFOX_ABI,
    source: 'explorer',
  };
}
