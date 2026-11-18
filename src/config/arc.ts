import { defineChain, isAddress, type Address } from 'viem';

export const ARC_CHAIN_ID = 5042002;
export const ARC_RPC_URL = 'https://rpc.testnet.arc.network';
export const ARC_EXPLORER_URL = 'https://testnet.arcscan.app';

export const arcChain = defineChain({
  id: ARC_CHAIN_ID,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ARC_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan',
      url: ARC_EXPLORER_URL,
    },
  },
});

export interface KnownToken {
  symbol: 'USDC' | 'EURC';
  name: string;
  address: Address;
}

export const USDC_ADDRESS: Address = '0x3600000000000000000000000000000000000000';
export const EURC_ADDRESS: Address = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

export const SUPPORTED_TOKENS: KnownToken[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: USDC_ADDRESS,
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    address: EURC_ADDRESS,
  },
];

function sanitizeConfigValue(raw: string | undefined): string {
  const val = (raw ?? '').trim();
  if (!val || (val.startsWith('[') && val.endsWith(']'))) {
    return '';
  }
  return val;
}

export function getContractAddress(): Address | null {
  const raw = sanitizeConfigValue(import.meta.env.VITE_CONTRACT_ADDRESS);
  if (raw && isAddress(raw)) {
    return raw;
  }
  return null;
}

export function getWalletConnectProjectId(): string {
  return sanitizeConfigValue(import.meta.env.VITE_WALLETCONNECT_ID);
}

export function getAdminWalletAddress(): Address | null {
  const raw = sanitizeConfigValue(import.meta.env.VITE_ADMIN_WALLET);
  if (raw && isAddress(raw)) {
    return raw;
  }
  return null;
}

export function getExplorerTxUrl(txHash: string): string {
  return `${ARC_EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${ARC_EXPLORER_URL}/address/${address}`;
}
