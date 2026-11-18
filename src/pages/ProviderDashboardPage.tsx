import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAddress, type Address } from 'viem';
import { useAccount } from 'wagmi';
import { ContractConfigNotice } from '../components/ContractConfigNotice';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';
import {
  getAdminWalletAddress,
  SUPPORTED_TOKENS,
  USDC_ADDRESS,
} from '../config/arc';
import {
  useContractAbi,
  useServicesList,
  useTokenMetadata,
  useUglyfoxActions,
  useWalletTokenBalances,
} from '../hooks/useUglyfoxContract';
import {
  formatExactTokenAmount,
  formatIntegerCount,
  formatTokenAmount,
  parseTokenAmountSafe,
  truncateAddress,
  validateAmountInput,
} from '../utils/format';
import { isTxBusy } from '../utils/txState';

export function ProviderDashboardPage() {
  const { address, isConnected } = useAccount();
  const { contractConfigured } = useContractAbi();
  const servicesQuery = useServicesList();
  const balancesQuery = useWalletTokenBalances();
  const tokenMetaQuery = useTokenMetadata();
  const {
    txState,
    resetTxState,
    registerService,
    updateService,
    recordUsage,
    claimEarnings,
  } = useUglyfoxActions();

  const adminWallet = getAdminWalletAddress();
  const isAdmin =
    Boolean(adminWallet && address) &&
    adminWallet!.toLowerCase() === address!.toLowerCase();

  const myServices = useMemo(() => {
    if (!address) return [];
    return (servicesQuery.data ?? []).filter(
      (s) => s.provider.toLowerCase() === address.toLowerCase()
    );
  }, [servicesQuery.data, address]);

  // Register / Update Service State
  const [formMode, setFormMode] = useState<'register' | 'update'>('register');
  const [editingServiceId, setEditingServiceId] = useState<string>('');
  const [svcName, setSvcName] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcToken, setSvcToken] = useState<Address>(USDC_ADDRESS);
  const [svcActive, setSvcActive] = useState(true);
  const [svcError, setSvcError] = useState<string | null>(null);

  // Record Usage State
  const [usageServiceId, setUsageServiceId] = useState<string>('');
  const [consumerAddress, setConsumerAddress] = useState('');
  const [callCountInput, setCallCountInput] = useState('1');
  const [usageError, setUsageError] = useState<string | null>(null);

  const selectedTokenDecimals =
    tokenMetaQuery.data?.[svcToken.toLowerCase()]?.decimals ?? 6;
  const selectedTokenSymbol =
    tokenMetaQuery.data?.[svcToken.toLowerCase()]?.symbol ?? 'USDC';

  const loadServiceIntoEdit = (idStr: string) => {
    const found = myServices.find((s) => s.id.toString() === idStr);
    if (!found) return;
    setFormMode('update');
    setEditingServiceId(found.id.toString());
    setSvcName(found.name);
    setSvcDesc(found.description);
    setSvcPrice(
      formatExactTokenAmount(found.pricePerCall, found.tokenDecimals).replace(/,/g, '')
    );
    setSvcToken(found.token);
    setSvcActive(found.active);
    setSvcError(null);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = svcName.trim();
    const trimmedDesc = svcDesc.trim();
    if (!trimmedName) {
      setSvcError('Enter a service name');
      return;
    }
    if (!trimmedDesc) {
      setSvcError('Enter a service description');
      return;
    }

    const priceErr = validateAmountInput(svcPrice, selectedTokenDecimals);
    if (priceErr) {
      setSvcError(priceErr);
      return;
    }

    const parsedPrice = parseTokenAmountSafe(svcPrice, selectedTokenDecimals);
    if (!parsedPrice) return;

    setSvcError(null);

    if (formMode === 'register') {
      const hash = await registerService(trimmedName, trimmedDesc, parsedPrice, svcToken);
      if (hash) {
        setSvcName('');
        setSvcDesc('');
        setSvcPrice('');
      }
    } else {
      if (!editingServiceId) {
        setSvcError('Select a service to update');
        return;
      }
      await updateService(
        BigInt(editingServiceId),
        trimmedName,
        trimmedDesc,
        parsedPrice,
        svcToken,
        svcActive
      );
    }
  };

  const activeUsageService = useMemo(() => {
    if (usageServiceId) {
      return myServices.find((s) => s.id.toString() === usageServiceId) ?? myServices[0];
    }
    return myServices[0];
  }, [myServices, usageServiceId]);

  const parsedCalls = /^\d+$/.test(callCountInput.trim())
    ? BigInt(callCountInput.trim())
    : 0n;

  const estimatedCharge =
    activeUsageService && parsedCalls > 0n
      ? activeUsageService.pricePerCall * parsedCalls
      : 0n;

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUsageService) {
      setUsageError('Register a service before recording usage');
      return;
    }
    const consumer = consumerAddress.trim();
    if (!isAddress(consumer)) {
      setUsageError('Enter a valid consumer wallet address');
      return;
    }
    if (parsedCalls <= 0n) {
      setUsageError('Call count must be a positive whole number');
      return;
    }

    setUsageError(null);
    const hash = await recordUsage(activeUsageService.id, consumer, parsedCalls);
    if (hash) {
      setConsumerAddress('');
      setCallCountInput('1');
    }
  };

  const busy = isTxBusy(txState.phase);
  const balances = balancesQuery.data ?? [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b-[3px] border-[#0D0D0D] pb-6">
        <div className="space-y-2">
          <p className="label-caps text-[#0D0D0D]">Service management & payouts</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0D0D0D]">
            Provider dashboard
          </h1>
        </div>
        {isConnected && address && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <span className="font-mono text-xs font-bold uppercase bg-[#0D0D0D] text-[#FFD60A] border-[3px] border-[#0D0D0D] px-3 py-2">
                ADMIN
              </span>
            )}
            <span className="font-mono text-xs font-bold uppercase bg-[#FFD60A] border-[3px] border-[#0D0D0D] px-3 py-2 tabular-nums">
              PROVIDER {truncateAddress(address)}
            </span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <WalletGate
          title="Connect your wallet to manage services and earnings"
          description="Service registration, usage metering, and claimable provider earnings stay hidden until your wallet is connected."
        />
      ) : (
        <>
          {!contractConfigured && <ContractConfigNotice />}
          <TxStatusBanner state={txState} onDismiss={resetTxState} />

          {/* Claimable Earnings */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              Claimable earnings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUPPORTED_TOKENS.map((tok) => {
                const info = balances.find(
                  (b) => b.token.address.toLowerCase() === tok.address.toLowerCase()
                );
                const decimals = info?.token.decimals ?? 6;
                const claimable = info?.providerEarnings ?? 0n;

                return (
                  <div
                    key={tok.address}
                    className="brutal-card p-6 bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="label-caps text-[#0D0D0D]">
                        {tok.symbol} · Earned fees
                      </p>
                      <p className="font-mono text-3xl font-bold text-[#0D0D0D] tabular-nums">
                        {balancesQuery.isLoading
                          ? '...'
                          : `${formatTokenAmount(claimable, decimals)} ${tok.symbol}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!contractConfigured || busy || claimable === 0n}
                      onClick={() => claimEarnings(tok.address)}
                      className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                      Claim {tok.symbol}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Register/Update Service & Record Usage Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Register or Update Service */}
            <div className="lg:col-span-7 brutal-card p-6 sm:p-8 bg-[#FFFFFF] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="label-caps text-[#0D0D0D]">Service catalog</p>
                  <h2 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
                    Register or update a service
                  </h2>
                </div>

                <div className="flex border-[3px] border-[#0D0D0D] self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode('register');
                      setEditingServiceId('');
                      setSvcName('');
                      setSvcDesc('');
                      setSvcPrice('');
                      setSvcError(null);
                    }}
                    className={`px-3 py-2 font-mono text-xs font-bold uppercase ${
                      formMode === 'register'
                        ? 'bg-[#FFD60A] text-[#0D0D0D]'
                        : 'bg-[#FFFFFF] text-[#0D0D0D]'
                    }`}
                  >
                    Register New
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode('update');
                      if (myServices.length > 0 && !editingServiceId) {
                        loadServiceIntoEdit(myServices[0].id.toString());
                      }
                    }}
                    className={`px-3 py-2 font-mono text-xs font-bold uppercase ${
                      formMode === 'update'
                        ? 'bg-[#FFD60A] text-[#0D0D0D]'
                        : 'bg-[#FFFFFF] text-[#0D0D0D]'
                    }`}
                  >
                    Update Existing
                  </button>
                </div>
              </div>

              <form onSubmit={handleServiceSubmit} className="space-y-4">
                {formMode === 'update' && (
                  <div className="space-y-1.5">
                    <label htmlFor="edit-service-select" className="label-caps block text-[#0D0D0D]">
                      Select service to update
                    </label>
                    {myServices.length === 0 ? (
                      <p className="border-[2px] border-[#0D0D0D] bg-[#EDEDED] px-3 py-2 font-mono text-xs text-[#0D0D0D]">
                        You have no registered services yet. Switch to Register New to list one.
                      </p>
                    ) : (
                      <select
                        id="edit-service-select"
                        value={editingServiceId}
                        onChange={(e) => loadServiceIntoEdit(e.target.value)}
                        className="brutal-input w-full px-3 py-2.5 text-sm font-bold"
                      >
                        {myServices.map((svc) => (
                          <option key={svc.id.toString()} value={svc.id.toString()}>
                            #{svc.id.toString()} · {svc.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="svc-name" className="label-caps block text-[#0D0D0D]">
                    Service name
                  </label>
                  <input
                    id="svc-name"
                    type="text"
                    value={svcName}
                    onChange={(e) => {
                      setSvcName(e.target.value);
                      setSvcError(null);
                    }}
                    placeholder="Market Data Inference API"
                    className="brutal-input w-full px-4 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="svc-desc" className="label-caps block text-[#0D0D0D]">
                    Description
                  </label>
                  <textarea
                    id="svc-desc"
                    rows={3}
                    value={svcDesc}
                    onChange={(e) => {
                      setSvcDesc(e.target.value);
                      setSvcError(null);
                    }}
                    placeholder="Describe what each API call returns and how consumers use it"
                    className="brutal-input w-full px-4 py-2.5 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="svc-price" className="label-caps block text-[#0D0D0D]">
                      Price per call ({selectedTokenSymbol})
                    </label>
                    <input
                      id="svc-price"
                      type="text"
                      inputMode="decimal"
                      value={svcPrice}
                      onChange={(e) => {
                        setSvcPrice(e.target.value);
                        setSvcError(null);
                      }}
                      placeholder="0.005"
                      className="brutal-input w-full px-4 py-2.5 font-mono text-sm font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="label-caps block text-[#0D0D0D]">Settlement token</span>
                    <div className="flex border-[3px] border-[#0D0D0D]">
                      {SUPPORTED_TOKENS.map((tok) => {
                        const active = tok.address.toLowerCase() === svcToken.toLowerCase();
                        return (
                          <button
                            key={tok.address}
                            type="button"
                            onClick={() => setSvcToken(tok.address)}
                            className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase ${
                              active
                                ? 'bg-[#FFD60A] text-[#0D0D0D]'
                                : 'bg-[#FFFFFF] text-[#0D0D0D] hover:bg-[#EDEDED]'
                            }`}
                          >
                            {tok.symbol}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {formMode === 'update' && (
                  <label className="inline-flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={svcActive}
                      onChange={(e) => setSvcActive(e.target.checked)}
                      className="w-5 h-5 accent-[#0D0D0D] border-[3px] border-[#0D0D0D]"
                    />
                    <span className="font-mono text-xs font-bold uppercase text-[#0D0D0D]">
                      Service active for new calls
                    </span>
                  </label>
                )}

                {svcError && (
                  <p className="border-[2px] border-[#0D0D0D] bg-[#FFD60A] px-3 py-2 font-mono text-xs font-bold text-[#0D0D0D]">
                    {svcError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!contractConfigured || busy || (formMode === 'update' && myServices.length === 0)}
                  className="brutal-btn w-full bg-[#FFD60A] text-[#0D0D0D] px-5 py-3.5 text-sm"
                >
                  {formMode === 'register' ? 'Register Service' : 'Save Service Update'}
                </button>
              </form>
            </div>

            {/* Record Usage Form */}
            <div className="lg:col-span-5 brutal-card p-6 sm:p-8 bg-[#FFFFFF] space-y-5">
              <div className="space-y-1">
                <p className="label-caps text-[#0D0D0D]">Meter consumer calls</p>
                <h2 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
                  Record usage
                </h2>
              </div>

              <form onSubmit={handleRecordUsage} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="usage-service" className="label-caps block text-[#0D0D0D]">
                    Your service
                  </label>
                  {myServices.length === 0 ? (
                    <div className="border-[2px] border-[#0D0D0D] bg-[#EDEDED] px-3 py-2.5 font-mono text-xs text-[#0D0D0D]">
                      Register a service first to record consumer usage
                    </div>
                  ) : (
                    <select
                      id="usage-service"
                      value={activeUsageService?.id.toString() ?? ''}
                      onChange={(e) => setUsageServiceId(e.target.value)}
                      className="brutal-input w-full px-3 py-2.5 text-sm font-bold"
                    >
                      {myServices.map((svc) => (
                        <option key={svc.id.toString()} value={svc.id.toString()}>
                          #{svc.id.toString()} · {svc.name} (
                          {formatTokenAmount(svc.pricePerCall, svc.tokenDecimals, 6)}{' '}
                          {svc.tokenSymbol})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="consumer-addr" className="label-caps block text-[#0D0D0D]">
                    Consumer wallet address
                  </label>
                  <input
                    id="consumer-addr"
                    type="text"
                    value={consumerAddress}
                    onChange={(e) => {
                      setConsumerAddress(e.target.value);
                      setUsageError(null);
                    }}
                    placeholder="0x..."
                    className="brutal-input w-full px-4 py-2.5 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="calls-count" className="label-caps block text-[#0D0D0D]">
                    Calls to deduct
                  </label>
                  <input
                    id="calls-count"
                    type="number"
                    min={1}
                    step={1}
                    value={callCountInput}
                    onChange={(e) => {
                      setCallCountInput(e.target.value);
                      setUsageError(null);
                    }}
                    className="brutal-input w-full px-4 py-2.5 font-mono text-sm font-bold tabular-nums"
                  />
                </div>

                {activeUsageService && (
                  <div className="border-[2px] border-[#0D0D0D] bg-[#EDEDED] px-3 py-2.5 font-mono text-xs text-[#0D0D0D] flex items-center justify-between tabular-nums">
                    <span>Total deduction</span>
                    <strong>
                      {formatTokenAmount(
                        estimatedCharge,
                        activeUsageService.tokenDecimals,
                        6
                      )}{' '}
                      {activeUsageService.tokenSymbol}
                    </strong>
                  </div>
                )}

                {usageError && (
                  <p className="border-[2px] border-[#0D0D0D] bg-[#FFD60A] px-3 py-2 font-mono text-xs font-bold text-[#0D0D0D]">
                    {usageError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!contractConfigured || busy || myServices.length === 0}
                  className="brutal-btn w-full bg-[#E6007A] text-[#FFFFFF] px-5 py-3.5 text-sm"
                >
                  Record Usage On Chain
                </button>
              </form>
            </div>
          </div>

          {/* Your Listed Services Table */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              Your listed services
            </h2>

            {servicesQuery.isLoading ? (
              <div className="brutal-card h-40 bg-[#EDEDED] animate-pulse" />
            ) : myServices.length === 0 ? (
              <div className="brutal-card p-8 bg-[#EDEDED]">
                <p className="label-caps text-[#0D0D0D]">Empty provider list</p>
                <p className="text-base font-bold text-[#0D0D0D] mt-1">
                  This wallet has not registered any services yet.
                </p>
              </div>
            ) : (
              <div className="brutal-card overflow-x-auto bg-[#FFFFFF]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0D0D0D] text-[#FFFFFF] border-b-[3px] border-[#0D0D0D]">
                      <th className="label-caps px-4 py-3">ID & Name</th>
                      <th className="label-caps px-4 py-3">Status</th>
                      <th className="label-caps px-4 py-3">Price per call</th>
                      <th className="label-caps px-4 py-3 text-right">Total calls</th>
                      <th className="label-caps px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myServices.map((svc, idx) => (
                      <tr
                        key={svc.id.toString()}
                        className={`border-b-[2px] border-[#0D0D0D] ${
                          idx % 2 === 1 ? 'bg-[#EDEDED]' : 'bg-[#FFFFFF]'
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-sm text-[#0D0D0D]">
                          #{svc.id.toString()} · {svc.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold uppercase text-[#0D0D0D]">
                          {svc.active ? 'ACTIVE' : 'PAUSED'}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-[#0D0D0D] tabular-nums">
                          {formatTokenAmount(svc.pricePerCall, svc.tokenDecimals, 6)}{' '}
                          {svc.tokenSymbol}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-[#0D0D0D] tabular-nums text-right">
                          {formatIntegerCount(svc.totalCalls)}
                        </td>
                        <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => loadServiceIntoEdit(svc.id.toString())}
                            className="font-mono text-xs font-bold underline underline-offset-4 text-[#0D0D0D]"
                          >
                            Edit
                          </button>
                          <Link
                            to={`/service/${svc.id.toString()}`}
                            className="font-mono text-xs font-bold underline underline-offset-4 text-[#0D0D0D]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
