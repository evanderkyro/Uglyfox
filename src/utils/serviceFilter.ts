export interface ServiceRecord {
  id: bigint;
  provider: `0x${string}`;
  name: string;
  description: string;
  pricePerCall: bigint;
  token: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  active: boolean;
  totalCalls: bigint;
}

export type TokenFilter = 'ALL' | 'USDC' | 'EURC';
export type ServiceSort = 'newest' | 'price_asc' | 'price_desc' | 'calls_desc';

export function filterAndSortServices(
  services: readonly ServiceRecord[],
  query: string,
  tokenFilter: TokenFilter,
  sortBy: ServiceSort
): ServiceRecord[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = services.filter((svc) => {
    if (tokenFilter !== 'ALL' && svc.tokenSymbol.toUpperCase() !== tokenFilter) {
      return false;
    }

    if (!normalizedQuery) return true;

    return (
      svc.name.toLowerCase().includes(normalizedQuery) ||
      svc.description.toLowerCase().includes(normalizedQuery) ||
      svc.provider.toLowerCase().includes(normalizedQuery) ||
      svc.id.toString() === normalizedQuery
    );
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        if (a.pricePerCall < b.pricePerCall) return -1;
        if (a.pricePerCall > b.pricePerCall) return 1;
        return 0;
      case 'price_desc':
        if (a.pricePerCall > b.pricePerCall) return -1;
        if (a.pricePerCall < b.pricePerCall) return 1;
        return 0;
      case 'calls_desc':
        if (a.totalCalls > b.totalCalls) return -1;
        if (a.totalCalls < b.totalCalls) return 1;
        return 0;
      case 'newest':
      default:
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
    }
  });

  return sorted;
}
