import { ExternalLink, X } from 'lucide-react';
import { getExplorerTxUrl } from '../config/arc';
import { isTxBusy, type TxLifecycleState } from '../utils/txState';
import { UglyfoxLogo } from './UglyfoxLogo';

interface TxStatusBannerProps {
  state: TxLifecycleState;
  onDismiss: () => void;
}

export function TxStatusBanner({ state, onDismiss }: TxStatusBannerProps) {
  if (state.phase === 'idle') return null;

  const busy = isTxBusy(state.phase);
  const isError = state.phase === 'error';
  const isConfirmed = state.phase === 'confirmed';

  const bgClass = isError
    ? 'bg-[#E6007A] text-[#FFFFFF]'
    : isConfirmed
      ? 'bg-[#FFD60A] text-[#0D0D0D]'
      : 'bg-[#FFFFFF] text-[#0D0D0D]';

  const stepLabel =
    state.phase === 'checking_allowance'
      ? 'STEP 1 OF 2 · ALLOWANCE CHECK'
      : state.phase === 'approve_pending' || state.phase === 'approve_confirming'
        ? 'STEP 1 OF 2 · ERC20 APPROVAL'
        : state.phase === 'tx_pending' || state.phase === 'tx_confirming'
          ? 'CONTRACT TRANSACTION'
          : isConfirmed
            ? 'CONFIRMED ON ARC'
            : 'TRANSACTION FAILED';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`border-[3px] border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-4 sm:p-5 ${bgClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <UglyfoxLogo size={24} />
          </div>
          <div className="space-y-1">
            <p className="label-caps">{stepLabel}</p>
            <p className="text-sm sm:text-base font-bold">
              {busy ? `${state.label}...` : state.label}
            </p>
            {state.txHash && (
              <a
                href={getExplorerTxUrl(state.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold underline underline-offset-4 ${
                  isError ? 'text-[#FFFFFF]' : 'text-[#0D0D0D]'
                }`}
              >
                <span>View transaction on Arcscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {!busy && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss transaction status"
            className="border-[2px] border-[#0D0D0D] bg-[#FFFFFF] text-[#0D0D0D] p-1 hover:bg-[#EDEDED]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
