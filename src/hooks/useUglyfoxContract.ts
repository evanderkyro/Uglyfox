import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { type Abi, type Address } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi';
import { erc20Abi, fetchDeployedContractAbi } from '../abi/uglyfoxBilling';
import {
  ARC_CHAIN_ID,
  EURC_ADDRESS,
  getContractAddress,
  SUPPORTED_TOKENS,
  USDC_ADDRESS,
} from '../config/arc';
import { findAbiFunction, needsApproval, type AbiFunctionEntry } from '../utils/abiInspector';
import type { ServiceRecord } from '../utils/serviceFilter';
import {
  createTxState,
  extractReadableError,
  INITIAL_TX_STATE,
  type TxLifecycleState,
} from '../utils/txState';

export interface TokenMeta {
  address: Address;
  symbol: string;
  decimals: number;
}

export interface PlatformStats {
  totalServices: bigint;
  totalCalls: bigint;
  totalUsdcVolume: bigint;
  totalEurcVolume: bigint;
}

export interface WalletTokenBalance {
  token: TokenMeta;
  walletBalance: bigint;
  prepaidBalance: bigint;
  allowance: bigint;
  providerEarnings: bigint;
}

export interface UserServiceUsage {
  service: ServiceRecord;
  callsUsed: bigint;
  totalSpent: bigint;
}

function normalizeRawService(raw: unknown, fallbackId: bigint): {
  id: bigint;
  provider: Address;
  name: string;
  description: string;
  pricePerCall: bigint;
  token: Address;
  active: boolean;
  totalCalls: bigint;
} | null {
  if (!raw || typeof raw !== 'object') return null;

  if (Array.isArray(raw)) {
    if (raw.length < 6) return null;
    if (raw.length >= 8) {
      return {
        id: BigInt(raw[0] ?? fallbackId),
        provider: raw[1] as Address,
        name: String(raw[2] ?? ''),
        description: String(raw[3] ?? ''),
        pricePerCall: BigInt(raw[4] ?? 0n),
        token: raw[5] as Address,
        active: Boolean(raw[6]),
        totalCalls: BigInt(raw[7] ?? 0n),
      };
    }
    return {
      id: fallbackId,
      provider: raw[0] as Address,
      name: String(raw[1] ?? ''),
      description: String(raw[2] ?? ''),
      pricePerCall: BigInt(raw[3] ?? 0n),
      token: raw[4] as Address,
      active: Boolean(raw[5]),
      totalCalls: BigInt(raw[6] ?? 0n),
    };
  }

  const obj = raw as Record<string, unknown>;
  const provider = (obj.provider ?? obj.owner) as Address | undefined;
  const token = (obj.token ?? obj.paymentToken) as Address | undefined;
  if (!provider || !token) return null;

  return {
    id: obj.id !== undefined ? BigInt(obj.id as string | number | bigint) : fallbackId,
    provider,
    name: String(obj.name ?? ''),
    description: String(obj.description ?? ''),
    pricePerCall: BigInt((obj.pricePerCall ?? obj.price ?? 0) as string | number | bigint),
    token,
    active: obj.active !== undefined ? Boolean(obj.active) : true,
    totalCalls: BigInt((obj.totalCalls ?? obj.calls ?? 0) as string | number | bigint),
  };
}

export function useContractAbi() {
  const contractAddress = getContractAddress();

  const query = useQuery({
    queryKey: ['uglyfox-abi', contractAddress ?? 'unconfigured'],
    queryFn: () => fetchDeployedContractAbi(contractAddress),
    staleTime: 1000 * 60 * 10,
  });

  return {
    contractAddress,
    contractConfigured: Boolean(contractAddress),
    abi: query.data?.abi,
    isLoadingAbi: query.isLoading,
  };
}

export function useTokenMetadata(extraTokens: Address[] = []) {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });

  const addresses = useMemo(() => {
    const map = new Map<string, Address>();
    for (const t of SUPPORTED_TOKENS) {
      map.set(t.address.toLowerCase(), t.address);
    }
    for (const addr of extraTokens) {
      if (addr) map.set(addr.toLowerCase(), addr);
    }
    return Array.from(map.values());
  }, [extraTokens]);

  return useQuery({
    queryKey: ['arc-token-meta', addresses.join(',')],
    enabled: Boolean(publicClient),
    staleTime: 1000 * 60 * 30,
    queryFn: async (): Promise<Record<string, TokenMeta>> => {
      const map: Record<string, TokenMeta> = {};
      if (!publicClient) return map;

      await Promise.all(
        addresses.map(async (addr) => {
          const fallbackSymbol =
            addr.toLowerCase() === USDC_ADDRESS.toLowerCase()
              ? 'USDC'
              : addr.toLowerCase() === EURC_ADDRESS.toLowerCase()
                ? 'EURC'
                : 'TOKEN';
          try {
            const [decimals, symbol] = await Promise.all([
              publicClient.readContract({
                address: addr,
                abi: erc20Abi,
                functionName: 'decimals',
              }),
              publicClient.readContract({
                address: addr,
                abi: erc20Abi,
                functionName: 'symbol',
              }),
            ]);
            map[addr.toLowerCase()] = {
              address: addr,
              decimals: Number(decimals),
              symbol: String(symbol || fallbackSymbol),
            };
          } catch {
            map[addr.toLowerCase()] = {
              address: addr,
              decimals: 6,
              symbol: fallbackSymbol,
            };
          }
        })
      );

      return map;
    },
  });
}

export function useServicesList() {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { contractAddress, contractConfigured, abi } = useContractAbi();
  const tokenMetaQuery = useTokenMetadata();

  return useQuery({
    queryKey: ['uglyfox-services', contractAddress, Boolean(abi)],
    enabled: Boolean(publicClient && contractConfigured && abi),
    queryFn: async (): Promise<ServiceRecord[]> => {
      if (!publicClient || !contractAddress || !abi) return [];

      const abiEntries = abi as unknown as AbiFunctionEntry[];
      const getAllFn = findAbiFunction(abiEntries, 'getAllServices');
      const countFn = findAbiFunction(abiEntries, 'serviceCount');
      const getOneFn = findAbiFunction(abiEntries, 'getService');

      const rawServices: Array<{ raw: unknown; id: bigint }> = [];

      if (getAllFn?.name) {
        try {
          const res = (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: getAllFn.name,
          })) as unknown[];
          if (Array.isArray(res)) {
            res.forEach((item, idx) => rawServices.push({ raw: item, id: BigInt(idx + 1) }));
          }
        } catch {
          // Try count + indexed lookup fallback
        }
      }

      if (rawServices.length === 0 && countFn?.name && getOneFn?.name) {
        const total = BigInt(
          (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: countFn.name,
          })) as bigint
        );

        const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
        const fetched = await Promise.all(
          ids.map(async (id) => {
            try {
              const item = await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: getOneFn.name!,
                args: [id],
              });
              return { raw: item, id };
            } catch {
              return null;
            }
          })
        );
        for (const entry of fetched) {
          if (entry) rawServices.push(entry);
        }
      }

      const tokenMap = tokenMetaQuery.data ?? {};
      const results: ServiceRecord[] = [];

      for (const { raw, id } of rawServices) {
        const norm = normalizeRawService(raw, id);
        if (!norm || !norm.name) continue;

        let meta = tokenMap[norm.token.toLowerCase()];
        if (!meta) {
          try {
            const [dec, sym] = await Promise.all([
              publicClient.readContract({
                address: norm.token,
                abi: erc20Abi,
                functionName: 'decimals',
              }),
              publicClient.readContract({
                address: norm.token,
                abi: erc20Abi,
                functionName: 'symbol',
              }),
            ]);
            meta = { address: norm.token, decimals: Number(dec), symbol: String(sym) };
          } catch {
            meta = {
              address: norm.token,
              decimals: 6,
              symbol:
                norm.token.toLowerCase() === EURC_ADDRESS.toLowerCase() ? 'EURC' : 'USDC',
            };
          }
        }

        results.push({
          ...norm,
          tokenSymbol: meta.symbol,
          tokenDecimals: meta.decimals,
        });
      }

      return results;
    },
  });
}

export function usePlatformStats() {
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { contractAddress, contractConfigured, abi } = useContractAbi();
  const servicesQuery = useServicesList();

  return useQuery({
    queryKey: [
      'uglyfox-stats',
      contractAddress,
      servicesQuery.data?.length ?? 0,
      Boolean(abi),
    ],
    queryFn: async (): Promise<PlatformStats> => {
      const zeroStats: PlatformStats = {
        totalServices: 0n,
        totalCalls: 0n,
        totalUsdcVolume: 0n,
        totalEurcVolume: 0n,
      };

      if (!publicClient || !contractAddress || !abi) {
        return zeroStats;
      }

      const abiEntries = abi as unknown as AbiFunctionEntry[];
      const statsFn = findAbiFunction(abiEntries, 'getPlatformStats');

      if (statsFn?.name) {
        try {
          const res = (await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: statsFn.name,
          })) as unknown;

          if (Array.isArray(res) && res.length >= 2) {
            return {
              totalServices: BigInt(res[0] ?? 0),
              totalCalls: BigInt(res[1] ?? 0),
              totalUsdcVolume: BigInt(res[2] ?? 0),
              totalEurcVolume: BigInt(res[3] ?? 0),
            };
          }
          if (res && typeof res === 'object') {
            const obj = res as Record<string, unknown>;
            return {
              totalServices: BigInt((obj.totalServices ?? 0) as bigint),
              totalCalls: BigInt((obj.totalCalls ?? 0) as bigint),
              totalUsdcVolume: BigInt((obj.totalUsdcVolume ?? obj.totalVolume ?? 0) as bigint),
              totalEurcVolume: BigInt((obj.totalEurcVolume ?? 0) as bigint),
            };
          }
        } catch {
          // Derive strictly from real services read from contract if stats view differs
        }
      }

      const services = servicesQuery.data ?? [];
      let totalCalls = 0n;
      let totalUsdcVolume = 0n;
      let totalEurcVolume = 0n;

      for (const s of services) {
        totalCalls += s.totalCalls;
        const vol = s.totalCalls * s.pricePerCall;
        if (s.token.toLowerCase() === EURC_ADDRESS.toLowerCase()) {
          totalEurcVolume += vol;
        } else {
          totalUsdcVolume += vol;
        }
      }

      return {
        totalServices: BigInt(services.length),
        totalCalls,
        totalUsdcVolume,
        totalEurcVolume,
      };
    },
  });
}

export function useWalletTokenBalances() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { contractAddress, abi } = useContractAbi();
  const tokenMetaQuery = useTokenMetadata();

  return useQuery({
    queryKey: [
      'uglyfox-wallet-balances',
      address ?? 'disconnected',
      contractAddress ?? 'unconfigured',
      Boolean(tokenMetaQuery.data),
    ],
    enabled: Boolean(isConnected && address && publicClient && tokenMetaQuery.data),
    queryFn: async (): Promise<WalletTokenBalance[]> => {
      if (!address || !publicClient || !tokenMetaQuery.data) return [];

      const abiEntries = (abi ?? []) as unknown as AbiFunctionEntry[];
      const balanceFn = abi ? findAbiFunction(abiEntries, 'getBalance') : null;
      const earningsFn = abi ? findAbiFunction(abiEntries, 'getProviderEarnings') : null;

      return Promise.all(
        SUPPORTED_TOKENS.map(async (tok) => {
          const meta = tokenMetaQuery.data![tok.address.toLowerCase()] ?? {
            address: tok.address,
            symbol: tok.symbol,
            decimals: 6,
          };

          let walletBalance = 0n;
          let allowance = 0n;
          let prepaidBalance = 0n;
          let providerEarnings = 0n;

          try {
            walletBalance = (await publicClient.readContract({
              address: tok.address,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            })) as bigint;
          } catch {
            walletBalance = 0n;
          }

          if (contractAddress) {
            try {
              allowance = (await publicClient.readContract({
                address: tok.address,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [address, contractAddress],
              })) as bigint;
            } catch {
              allowance = 0n;
            }

            if (abi && balanceFn?.name) {
              try {
                prepaidBalance = (await publicClient.readContract({
                  address: contractAddress,
                  abi,
                  functionName: balanceFn.name,
                  args: [address, tok.address],
                })) as bigint;
              } catch {
                prepaidBalance = 0n;
              }
            }

            if (abi && earningsFn?.name) {
              try {
                providerEarnings = (await publicClient.readContract({
                  address: contractAddress,
                  abi,
                  functionName: earningsFn.name,
                  args: [address, tok.address],
                })) as bigint;
              } catch {
                providerEarnings = 0n;
              }
            }
          }

          return {
            token: meta,
            walletBalance,
            prepaidBalance,
            allowance,
            providerEarnings,
          };
        })
      );
    },
  });
}

export function useWalletServiceUsage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { contractAddress, contractConfigured, abi } = useContractAbi();
  const servicesQuery = useServicesList();

  return useQuery({
    queryKey: [
      'uglyfox-wallet-usage',
      address ?? 'disconnected',
      contractAddress ?? 'unconfigured',
      servicesQuery.data?.length ?? 0,
    ],
    enabled: Boolean(
      isConnected && address && publicClient && contractConfigured && abi && servicesQuery.data
    ),
    queryFn: async (): Promise<UserServiceUsage[]> => {
      if (!address || !publicClient || !contractAddress || !abi || !servicesQuery.data) {
        return [];
      }

      const usageFn = findAbiFunction(abi as unknown as AbiFunctionEntry[], 'getUsage');
      if (!usageFn?.name) return [];

      const rows = await Promise.all(
        servicesQuery.data.map(async (service) => {
          try {
            const callsUsed = BigInt(
              (await publicClient.readContract({
                address: contractAddress,
                abi,
                functionName: usageFn.name!,
                args: [address, service.id],
              })) as bigint
            );
            return {
              service,
              callsUsed,
              totalSpent: callsUsed * service.pricePerCall,
            };
          } catch {
            return {
              service,
              callsUsed: 0n,
              totalSpent: 0n,
            };
          }
        })
      );

      return rows.filter((r) => r.callsUsed > 0n);
    },
  });
}

export function useUglyfoxActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: ARC_CHAIN_ID });
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const { contractAddress, abi } = useContractAbi();

  const [txState, setTxState] = useState<TxLifecycleState>(INITIAL_TX_STATE);

  const resetTxState = useCallback(() => {
    setTxState(INITIAL_TX_STATE);
  }, []);

  const ensureReady = useCallback(async () => {
    if (!address || !walletClient) {
      throw new Error('Connect your wallet to continue');
    }
    if (!contractAddress || !abi) {
      throw new Error('Billing contract address is not configured yet');
    }
    if (!publicClient) {
      throw new Error('Arc RPC client is unavailable');
    }
    if (chainId !== ARC_CHAIN_ID) {
      await switchChainAsync({ chainId: ARC_CHAIN_ID });
    }
    return { address, walletClient, contractAddress, abi, publicClient };
  }, [address, walletClient, contractAddress, abi, publicClient, chainId, switchChainAsync]);

  const invalidateAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['uglyfox-services'] });
    await queryClient.invalidateQueries({ queryKey: ['uglyfox-stats'] });
    await queryClient.invalidateQueries({ queryKey: ['uglyfox-wallet-balances'] });
    await queryClient.invalidateQueries({ queryKey: ['uglyfox-wallet-usage'] });
  }, [queryClient]);

  const executeContractWrite = useCallback(
    async (
      operation: Parameters<typeof findAbiFunction>[1],
      args: unknown[],
      pendingLabel?: string
    ): Promise<`0x${string}` | null> => {
      try {
        const ctx = await ensureReady();
        const fn = findAbiFunction(ctx.abi as unknown as AbiFunctionEntry[], operation);
        if (!fn?.name) {
          throw new Error(`Deployed contract ABI does not expose ${operation}`);
        }

        setTxState(createTxState('tx_pending', { customLabel: pendingLabel }));
        const hash = await ctx.walletClient.writeContract({
          address: ctx.contractAddress,
          abi: ctx.abi as Abi,
          functionName: fn.name,
          args,
          account: ctx.address,
          chain: ctx.walletClient.chain,
        });

        setTxState(createTxState('tx_confirming', { txHash: hash }));
        await ctx.publicClient.waitForTransactionReceipt({ hash });

        setTxState(createTxState('confirmed', { txHash: hash }));
        await invalidateAll();
        return hash;
      } catch (err) {
        setTxState(createTxState('error', { errorMessage: extractReadableError(err) }));
        return null;
      }
    },
    [ensureReady, invalidateAll]
  );

  const topUpBalance = useCallback(
    async (tokenAddress: Address, amount: bigint): Promise<`0x${string}` | null> => {
      try {
        const ctx = await ensureReady();
        const topUpFn = findAbiFunction(ctx.abi as unknown as AbiFunctionEntry[], 'topUp');
        if (!topUpFn?.name) {
          throw new Error('Deployed contract ABI does not expose topUp');
        }

        setTxState(createTxState('checking_allowance'));
        const currentAllowance = (await ctx.publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [ctx.address, ctx.contractAddress],
        })) as bigint;

        if (needsApproval(currentAllowance, amount)) {
          setTxState(createTxState('approve_pending'));
          const approveHash = await ctx.walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [ctx.contractAddress, amount],
            account: ctx.address,
            chain: ctx.walletClient.chain,
          });

          setTxState(createTxState('approve_confirming', { txHash: approveHash }));
          await ctx.publicClient.waitForTransactionReceipt({ hash: approveHash });
        }

        setTxState(createTxState('tx_pending', { customLabel: 'Confirm prepaid top up in wallet' }));
        const depositHash = await ctx.walletClient.writeContract({
          address: ctx.contractAddress,
          abi: ctx.abi as Abi,
          functionName: topUpFn.name,
          args: [tokenAddress, amount],
          account: ctx.address,
          chain: ctx.walletClient.chain,
        });

        setTxState(createTxState('tx_confirming', { txHash: depositHash }));
        await ctx.publicClient.waitForTransactionReceipt({ hash: depositHash });

        setTxState(createTxState('confirmed', { txHash: depositHash }));
        await invalidateAll();
        return depositHash;
      } catch (err) {
        setTxState(createTxState('error', { errorMessage: extractReadableError(err) }));
        return null;
      }
    },
    [ensureReady, invalidateAll]
  );

  const withdrawBalance = useCallback(
    async (tokenAddress: Address, amount: bigint) =>
      executeContractWrite('withdraw', [tokenAddress, amount], 'Confirm withdrawal in wallet'),
    [executeContractWrite]
  );

  const registerService = useCallback(
    async (name: string, description: string, pricePerCall: bigint, tokenAddress: Address) =>
      executeContractWrite(
        'registerService',
        [name, description, pricePerCall, tokenAddress],
        'Confirm service registration in wallet'
      ),
    [executeContractWrite]
  );

  const updateService = useCallback(
    async (
      serviceId: bigint,
      name: string,
      description: string,
      pricePerCall: bigint,
      tokenAddress: Address,
      active: boolean
    ) =>
      executeContractWrite(
        'updateService',
        [serviceId, name, description, pricePerCall, tokenAddress, active],
        'Confirm service update in wallet'
      ),
    [executeContractWrite]
  );

  const recordUsage = useCallback(
    async (serviceId: bigint, consumer: Address, calls: bigint) =>
      executeContractWrite(
        'recordUsage',
        [serviceId, consumer, calls],
        'Confirm usage record in wallet'
      ),
    [executeContractWrite]
  );

  const claimEarnings = useCallback(
    async (tokenAddress: Address) =>
      executeContractWrite('claimEarnings', [tokenAddress], 'Confirm earnings claim in wallet'),
    [executeContractWrite]
  );

  return {
    txState,
    resetTxState,
    topUpBalance,
    withdrawBalance,
    registerService,
    updateService,
    recordUsage,
    claimEarnings,
  };
}
