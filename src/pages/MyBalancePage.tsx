import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Address } from 'viem';
import { useAccount } from 'wagmi';
import { ContractConfigNotice } from '../components/ContractConfigNotice';
import { TxStatusBanner } from '../components/TxStatusBanner';
import { WalletGate } from '../components/WalletGate';
import { SUPPORTED_TOKENS, USDC_ADDRESS } from '../config/arc';
import {
  useContractAbi,
  useUglyfoxActions,
  useWalletServiceUsage,
  useWalletTokenBalances,
} from '../hooks/useUglyfoxContract';
import { needsApproval } from '../utils/abiInspector';
import {
  formatExactTokenAmount,
  formatIntegerCount,
  formatTokenAmount,
  parseTokenAmountSafe,
  truncateAddress,
  validateAmountInput,
} from '../utils/format';
import { isTxBusy } from '../utils/txState';

export function MyBalancePage() {
  const { address, isConnected } = useAccount();
  const { contractConfigured } = useContractAbi();
  const balancesQuery = useWalletTokenBalances();
  const usageQuery = useWalletServiceUsage();
  const { txState, resetTxState, topUpBalance, withdrawBalance } = useUglyfoxActions();

  const [topUpToken, setTopUpToken] = useState<Address>(USDC_ADDRESS);
  const [topUpInput, setTopUpInput] = useState('');
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const [withdrawToken, setWithdrawToken] = useState<Address>(USDC_ADDRESS);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const balances = balancesQuery.data ?? [];

  const activeTopUpMeta = balances.find(
    (b) => b.token.address.toLowerCase() === topUpToken.toLowerCase()
  );
  const activeWithdrawMeta = balances.find(
    (b) => b.token.address.toLowerCase() === withdrawToken.toLowerCase()
  );

  const topUpDecimals = activeTopUpMeta?.token.decimals ?? 6;
  const topUpSymbol = activeTopUpMeta?.token.symbol ?? 'USDC';
  const topUpWalletBal = activeTopUpMeta?.walletBalance ?? 0n;
  const topUpAllowance = activeTopUpMeta?.allowance ?? 0n;

  const withdrawDecimals = activeWithdrawMeta?.token.decimals ?? 6;
  const withdrawSymbol = activeWithdrawMeta?.token.symbol ?? 'USDC';
  const withdrawPrepaidBal = activeWithdrawMeta?.prepaidBalance ?? 0n;

  const parsedTopUp = parseTokenAmountSafe(topUpInput, topUpDecimals);
  const requiresApprove =
    parsedTopUp !== null && parsedTopUp > 0n && needsApproval(topUpAllowance, parsedTopUp);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAmountInput(topUpInput, topUpDecimals, topUpWalletBal);
    if (err) {
      setTopUpError(err);
      return;
    }
    const parsed = parseTokenAmountSafe(topUpInput, topUpDecimals);
    if (!parsed) return;

    setTopUpError(null);
    const hash = await topUpBalance(topUpToken, parsed);
    if (hash) {
      setTopUpInput('');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAmountInput(withdrawInput, withdrawDecimals, withdrawPrepaidBal);
    if (err) {
      setWithdrawError(err);
      return;
    }
    const parsed = parseTokenAmountSafe(withdrawInput, withdrawDecimals);
    if (!parsed) return;

    setWithdrawError(null);
    const hash = await withdrawBalance(withdrawToken, parsed);
    if (hash) {
      setWithdrawInput('');
    }
  };

  const busy = isTxBusy(txState.phase);
  const usageRows = usageQuery.data ?? [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b-[3px] border-[#0D0D0D] pb-6">
        <div className="space-y-2">
          <p className="label-caps text-[#0D0D0D]">Consumer prepaid ledger</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0D0D0D]">
            My balance
          </h1>
        </div>
        {isConnected && address && (
          <span className="font-mono text-xs font-bold uppercase bg-[#FFD60A] border-[3px] border-[#0D0D0D] px-3 py-2 tabular-nums self-start sm:self-auto">
            WALLET {truncateAddress(address)}
          </span>
        )}
      </div>

      {!isConnected ? (
        <WalletGate
          title="Connect your wallet to manage prepaid balances"
          description="Your prepaid USDC and EURC balances, token allowances, withdrawals, and service usage stay hidden until your wallet is connected."
        />
      ) : (
        <>
          {!contractConfigured && <ContractConfigNotice />}
          <TxStatusBanner state={txState} onDismiss={resetTxState} />

          {/* Balance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUPPORTED_TOKENS.map((tok) => {
              const info = balances.find(
                (b) => b.token.address.toLowerCase() === tok.address.toLowerCase()
              );
              const decimals = info?.token.decimals ?? 6;
              const prepaid = info?.prepaidBalance ?? 0n;
              const walletBal = info?.walletBalance ?? 0n;
              const allowance = info?.allowance ?? 0n;

              return (
                <div key={tok.address} className="brutal-card bg-[#FFFFFF]">
                  <div className="bg-[#0D0D0D] text-[#FFFFFF] px-5 py-3 border-b-[3px] border-[#0D0D0D] flex items-center justify-between">
                    <span className="label-caps text-[#FFD60A]">
                      {tok.symbol} · {tok.name}
                    </span>
                    <span className="font-mono text-xs uppercase text-[#FFFFFF] tabular-nums">
                      {decimals} DECIMALS
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <p className="label-caps text-[#0D0D0D]">Prepaid contract balance</p>
                      <p className="font-mono text-3xl sm:text-4xl font-bold text-[#0D0D0D] tabular-nums mt-1.5">
                        {balancesQuery.isLoading
                          ? '...'
                          : `${formatTokenAmount(prepaid, decimals)} ${tok.symbol}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-[2px] border-[#0D0D0D]">
                      <div>
                        <p className="label-caps text-[#0D0D0D]">Wallet balance</p>
                        <p className="font-mono text-base font-bold text-[#0D0D0D] tabular-nums mt-1">
                          {balancesQuery.isLoading
                            ? '...'
                            : `${formatTokenAmount(walletBal, decimals)} ${tok.symbol}`}
                        </p>
                      </div>
                      <div>
                        <p className="label-caps text-[#0D0D0D]">Contract allowance</p>
                        <p className="font-mono text-base font-bold text-[#0D0D0D] tabular-nums mt-1">
                          {balancesQuery.isLoading
                            ? '...'
                            : `${formatTokenAmount(allowance, decimals)} ${tok.symbol}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Up & Withdraw Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Up Form */}
            <div className="brutal-card bg-[#FFFFFF] p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <p className="label-caps text-[#0D0D0D]">Deposit to contract</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
                  Top up prepaid balance
                </h2>
              </div>

              <form onSubmit={handleTopUp} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="label-caps block text-[#0D0D0D]">Token</span>
                  <div className="flex border-[3px] border-[#0D0D0D]">
                    {SUPPORTED_TOKENS.map((tok) => {
                      const active = tok.address.toLowerCase() === topUpToken.toLowerCase();
                      return (
                        <button
                          key={tok.address}
                          type="button"
                          onClick={() => {
                            setTopUpToken(tok.address);
                            setTopUpError(null);
                          }}
                          className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase transition-colors ${
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

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="topup-amount" className="label-caps text-[#0D0D0D]">
                      Amount ({topUpSymbol})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTopUpInput(formatExactTokenAmount(topUpWalletBal, topUpDecimals).replace(/,/g, ''));
                        setTopUpError(null);
                      }}
                      className="font-mono text-xs font-bold underline underline-offset-4 text-[#0D0D0D]"
                    >
                      Max: {formatTokenAmount(topUpWalletBal, topUpDecimals)}
                    </button>
                  </div>
                  <input
                    id="topup-amount"
                    type="text"
                    inputMode="decimal"
                    value={topUpInput}
                    onChange={(e) => {
                      setTopUpInput(e.target.value);
                      setTopUpError(null);
                    }}
                    placeholder="25.00"
                    className="brutal-input w-full px-4 py-3 font-mono text-base font-bold tabular-nums"
                  />
                </div>

                <div className="border-[2px] border-[#0D0D0D] bg-[#EDEDED] px-3 py-2 font-mono text-xs text-[#0D0D0D]">
                  {requiresApprove
                    ? `Approval required first for ${topUpSymbol} before depositing`
                    : `ERC20 allowance checked against ${topUpSymbol} contract`}
                </div>

                {topUpError && (
                  <p className="border-[2px] border-[#0D0D0D] bg-[#FFD60A] px-3 py-2 font-mono text-xs font-bold text-[#0D0D0D]">
                    {topUpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!contractConfigured || busy}
                  className="brutal-btn w-full bg-[#FFD60A] text-[#0D0D0D] px-5 py-3.5 text-sm"
                >
                  {requiresApprove
                    ? `Approve & Top Up ${topUpSymbol}`
                    : `Top Up ${topUpSymbol}`}
                </button>
              </form>
            </div>

            {/* Withdraw Form */}
            <div className="brutal-card bg-[#FFFFFF] p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <p className="label-caps text-[#0D0D0D]">Reclaim unused funds</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
                  Withdraw unused balance
                </h2>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="label-caps block text-[#0D0D0D]">Token</span>
                  <div className="flex border-[3px] border-[#0D0D0D]">
                    {SUPPORTED_TOKENS.map((tok) => {
                      const active = tok.address.toLowerCase() === withdrawToken.toLowerCase();
                      return (
                        <button
                          key={tok.address}
                          type="button"
                          onClick={() => {
                            setWithdrawToken(tok.address);
                            setWithdrawError(null);
                          }}
                          className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase transition-colors ${
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

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="withdraw-amount" className="label-caps text-[#0D0D0D]">
                      Amount ({withdrawSymbol})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawInput(
                          formatExactTokenAmount(withdrawPrepaidBal, withdrawDecimals).replace(
                            /,/g,
                            ''
                          )
                        );
                        setWithdrawError(null);
                      }}
                      className="font-mono text-xs font-bold underline underline-offset-4 text-[#0D0D0D]"
                    >
                      Available: {formatTokenAmount(withdrawPrepaidBal, withdrawDecimals)}
                    </button>
                  </div>
                  <input
                    id="withdraw-amount"
                    type="text"
                    inputMode="decimal"
                    value={withdrawInput}
                    onChange={(e) => {
                      setWithdrawInput(e.target.value);
                      setWithdrawError(null);
                    }}
                    placeholder="10.00"
                    className="brutal-input w-full px-4 py-3 font-mono text-base font-bold tabular-nums"
                  />
                </div>

                <div className="border-[2px] border-[#0D0D0D] bg-[#EDEDED] px-3 py-2 font-mono text-xs text-[#0D0D0D]">
                  Unused prepaid balance transfers directly back to your connected wallet
                </div>

                {withdrawError && (
                  <p className="border-[2px] border-[#0D0D0D] bg-[#FFD60A] px-3 py-2 font-mono text-xs font-bold text-[#0D0D0D]">
                    {withdrawError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!contractConfigured || busy || withdrawPrepaidBal === 0n}
                  className="brutal-btn w-full bg-[#FFFFFF] hover:bg-[#EDEDED] text-[#0D0D0D] px-5 py-3.5 text-sm"
                >
                  Withdraw {withdrawSymbol}
                </button>
              </form>
            </div>
          </div>

          {/* Usage Per Service Table */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              Usage per service
            </h2>

            {usageQuery.isLoading ? (
              <div className="brutal-card h-40 bg-[#EDEDED] animate-pulse" />
            ) : usageRows.length === 0 ? (
              <div className="brutal-card p-8 bg-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <p className="label-caps text-[#0D0D0D]">No usage recorded</p>
                  <p className="text-base font-bold text-[#0D0D0D]">
                    This wallet has not recorded calls against any listed service yet.
                  </p>
                </div>
                <Link
                  to="/explore"
                  className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="brutal-card overflow-x-auto bg-[#FFFFFF]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0D0D0D] text-[#FFFFFF] border-b-[3px] border-[#0D0D0D]">
                      <th className="label-caps px-4 py-3">Service</th>
                      <th className="label-caps px-4 py-3">Price per call</th>
                      <th className="label-caps px-4 py-3 text-right">Calls used</th>
                      <th className="label-caps px-4 py-3 text-right">Total spent</th>
                      <th className="label-caps px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageRows.map((row, idx) => (
                      <tr
                        key={row.service.id.toString()}
                        className={`border-b-[2px] border-[#0D0D0D] hover:bg-[#FFD60A] transition-colors ${
                          idx % 2 === 1 ? 'bg-[#EDEDED]' : 'bg-[#FFFFFF]'
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-sm text-[#0D0D0D]">
                          #{row.service.id.toString()} · {row.service.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-[#0D0D0D] tabular-nums">
                          {formatTokenAmount(
                            row.service.pricePerCall,
                            row.service.tokenDecimals,
                            6
                          )}{' '}
                          {row.service.tokenSymbol}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-[#0D0D0D] tabular-nums text-right">
                          {formatIntegerCount(row.callsUsed)}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-[#0D0D0D] tabular-nums text-right">
                          {formatTokenAmount(row.totalSpent, row.service.tokenDecimals, 6)}{' '}
                          {row.service.tokenSymbol}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/service/${row.service.id.toString()}`}
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
