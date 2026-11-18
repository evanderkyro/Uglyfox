import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ContractConfigNotice } from '../components/ContractConfigNotice';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';
import { getExplorerAddressUrl } from '../config/arc';
import {
  useContractAbi,
  useServicesList,
  useUglyfoxActions,
  useWalletServiceUsage,
  useWalletTokenBalances,
} from '../hooks/useUglyfoxContract';
import { computeEstimatedCalls, needsApproval } from '../utils/abiInspector';
import {
  formatIntegerCount,
  formatTokenAmount,
  parseTokenAmountSafe,
  truncateAddress,
  validateAmountInput,
} from '../utils/format';
import { isTxBusy } from '../utils/txState';

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useAccount();
  const { contractConfigured } = useContractAbi();
  const servicesQuery = useServicesList();
  const balancesQuery = useWalletTokenBalances();
  const usageQuery = useWalletServiceUsage();
  const { txState, resetTxState, topUpBalance } = useUglyfoxActions();

  const [topUpInput, setTopUpInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const service = (servicesQuery.data ?? []).find((s) => s.id.toString() === id);

  const tokenBalanceInfo = service
    ? (balancesQuery.data ?? []).find(
        (b) => b.token.address.toLowerCase() === service.token.toLowerCase()
      )
    : undefined;

  const usageEntry = service
    ? (usageQuery.data ?? []).find((u) => u.service.id === service.id)
    : undefined;

  const callsUsed = usageEntry?.callsUsed ?? 0n;
  const totalSpent = usageEntry?.totalSpent ?? 0n;
  const prepaidBalance = tokenBalanceInfo?.prepaidBalance ?? 0n;
  const walletTokenBalance = tokenBalanceInfo?.walletBalance ?? 0n;
  const allowance = tokenBalanceInfo?.allowance ?? 0n;

  const parsedTopUp = service
    ? parseTokenAmountSafe(topUpInput, service.tokenDecimals)
    : null;
  const requiresApprove =
    parsedTopUp !== null && parsedTopUp > 0n && needsApproval(allowance, parsedTopUp);

  const handleQuickTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    const err = validateAmountInput(topUpInput, service.tokenDecimals, walletTokenBalance);
    if (err) {
      setFormError(err);
      return;
    }

    const parsed = parseTokenAmountSafe(topUpInput, service.tokenDecimals);
    if (!parsed) return;

    setFormError(null);
    const hash = await topUpBalance(service.token, parsed);
    if (hash) {
      setTopUpInput('');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-8">
      <div>
        <Link
          to="/explore"
          className="brutal-btn-sm bg-[#FFFFFF] hover:bg-[#FFD60A] text-[#0D0D0D] px-4 py-2 text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {!contractConfigured ? (
        <ContractConfigNotice />
      ) : servicesQuery.isLoading ? (
        <div className="brutal-card h-80 bg-[#EDEDED] animate-pulse" />
      ) : !service ? (
        <div className="brutal-card p-8 sm:p-10 bg-[#FFFFFF] space-y-4">
          <p className="label-caps text-[#0D0D0D]">Service not found</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D0D]">
            Service details
          </h1>
          <p className="text-base text-[#0D0D0D]">
            No service with ID #{id} exists on the billing contract.
          </p>
          <Link
            to="/explore"
            className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-xs inline-block"
          >
            Browse All Services
          </Link>
        </div>
      ) : (
        <>
          {/* Service Spec Header */}
          <div className="brutal-card bg-[#FFFFFF]">
            <div className="bg-[#0D0D0D] text-[#FFFFFF] px-6 py-3 border-b-[3px] border-[#0D0D0D] flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold uppercase text-[#FFD60A] tabular-nums">
                SERVICE #{service.id.toString()} · {service.tokenSymbol}
              </span>
              <span className="font-mono text-xs font-bold uppercase text-[#FFFFFF]">
                STATUS {service.active ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0D0D0D]">
                  {service.name}
                </h1>
                <p className="text-base sm:text-lg text-[#0D0D0D] leading-relaxed">
                  {service.description || 'No description provided'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-6 font-mono text-xs text-[#0D0D0D]">
                  <a
                    href={getExplorerAddressUrl(service.provider)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 underline underline-offset-4 font-bold"
                  >
                    <span>Provider {truncateAddress(service.provider)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={getExplorerAddressUrl(service.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 underline underline-offset-4 font-bold"
                  >
                    <span>
                      {service.tokenSymbol} ({service.tokenDecimals} decimals)
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-[3px] border-[#0D0D0D] bg-[#FFD60A] p-5">
                  <p className="label-caps text-[#0D0D0D]">Price per call</p>
                  <p className="font-mono text-2xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                    {formatTokenAmount(service.pricePerCall, service.tokenDecimals, 6)}{' '}
                    {service.tokenSymbol}
                  </p>
                </div>

                <div className="border-[3px] border-[#0D0D0D] bg-[#EDEDED] p-5">
                  <p className="label-caps text-[#0D0D0D]">Total service calls</p>
                  <p className="font-mono text-2xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                    {formatIntegerCount(service.totalCalls)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <TxStatusBanner state={txState} onDismiss={resetTxState} />

          {/* Wallet-Gated Personal Usage & Top Up */}
          {!isConnected ? (
            <WalletGate
              title="Connect your wallet to inspect prepaid calls"
              description="Personal prepaid balance, calls used on this service, and quick top up controls stay hidden until your wallet is connected."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 brutal-card p-6 sm:p-8 bg-[#FFFFFF] space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
                  Your prepaid usage
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border-[3px] border-[#0D0D0D] bg-[#EDEDED] p-4">
                    <p className="label-caps text-[#0D0D0D]">Prepaid balance</p>
                    <p className="font-mono text-xl font-bold text-[#0D0D0D] tabular-nums mt-1.5">
                      {formatTokenAmount(prepaidBalance, service.tokenDecimals)}{' '}
                      {service.tokenSymbol}
                    </p>
                  </div>

                  <div className="border-[3px] border-[#0D0D0D] bg-[#EDEDED] p-4">
                    <p className="label-caps text-[#0D0D0D]">Estimated calls left</p>
                    <p className="font-mono text-xl font-bold text-[#0D0D0D] tabular-nums mt-1.5">
                      {formatIntegerCount(
                        computeEstimatedCalls(prepaidBalance, service.pricePerCall)
                      )}
                    </p>
                  </div>

                  <div className="border-[3px] border-[#0D0D0D] bg-[#FFD60A] p-4">
                    <p className="label-caps text-[#0D0D0D]">Calls used</p>
                    <p className="font-mono text-xl font-bold text-[#0D0D0D] tabular-nums mt-1.5">
                      {formatIntegerCount(callsUsed)}
                    </p>
                  </div>
                </div>

                <div className="border-t-[2px] border-[#0D0D0D] pt-4 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-mono text-sm text-[#0D0D0D] tabular-nums">
                    Total spent on this service:{' '}
                    <strong>
                      {formatTokenAmount(totalSpent, service.tokenDecimals, 6)}{' '}
                      {service.tokenSymbol}
                    </strong>
                  </span>
                  <Link
                    to="/balance"
                    className="brutal-btn-sm bg-[#FFFFFF] hover:bg-[#FFD60A] text-[#0D0D0D] px-4 py-2 text-xs"
                  >
                    Manage All Balances
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 brutal-card p-6 sm:p-8 bg-[#FFFFFF] space-y-5">
                <div className="space-y-1">
                  <p className="label-caps text-[#0D0D0D]">Fund prepaid balance</p>
                  <h2 className="text-2xl font-bold tracking-tight text-[#0D0D0D]">
                    Top up {service.tokenSymbol}
                  </h2>
                </div>

                <form onSubmit={handleQuickTopUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="detail-topup" className="label-caps text-[#0D0D0D]">
                        Amount ({service.tokenSymbol})
                      </label>
                      <span className="font-mono text-xs text-[#0D0D0D] tabular-nums">
                        Wallet: {formatTokenAmount(walletTokenBalance, service.tokenDecimals)}
                      </span>
                    </div>
                    <input
                      id="detail-topup"
                      type="text"
                      inputMode="decimal"
                      value={topUpInput}
                      onChange={(e) => {
                        setTopUpInput(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="10.00"
                      className="brutal-input w-full px-4 py-3 font-mono text-base font-bold tabular-nums"
                    />
                  </div>

                  {formError && (
                    <p className="font-mono text-xs font-bold text-[#0D0D0D] bg-[#FFD60A] border-[2px] border-[#0D0D0D] px-3 py-2">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isTxBusy(txState.phase)}
                    className="brutal-btn w-full bg-[#FFD60A] text-[#0D0D0D] px-5 py-3.5 text-sm"
                  >
                    {requiresApprove
                      ? `Approve & Top Up ${service.tokenSymbol}`
                      : `Top Up ${service.tokenSymbol}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
