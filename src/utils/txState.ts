export type TxPhase =
  | 'idle'
  | 'checking_allowance'
  | 'approve_pending'
  | 'approve_confirming'
  | 'tx_pending'
  | 'tx_confirming'
  | 'confirmed'
  | 'error';

export interface TxLifecycleState {
  phase: TxPhase;
  label: string;
  txHash?: `0x${string}`;
  errorMessage?: string;
}

export const INITIAL_TX_STATE: TxLifecycleState = {
  phase: 'idle',
  label: '',
};

export function createTxState(
  phase: TxPhase,
  options?: {
    txHash?: `0x${string}`;
    errorMessage?: string;
    customLabel?: string;
  }
): TxLifecycleState {
  const defaultLabels: Record<TxPhase, string> = {
    idle: '',
    checking_allowance: 'Checking ERC20 allowance',
    approve_pending: 'Confirm token approval in wallet',
    approve_confirming: 'Approval submitted Waiting for block confirmation',
    tx_pending: 'Confirm transaction in wallet',
    tx_confirming: 'Transaction submitted Waiting for block confirmation',
    confirmed: 'Confirmed on Arc',
    error: options?.errorMessage || 'Transaction failed',
  };

  return {
    phase,
    label: options?.customLabel || defaultLabels[phase],
    txHash: options?.txHash,
    errorMessage: options?.errorMessage,
  };
}

export function isTxBusy(phase: TxPhase): boolean {
  return (
    phase === 'checking_allowance' ||
    phase === 'approve_pending' ||
    phase === 'approve_confirming' ||
    phase === 'tx_pending' ||
    phase === 'tx_confirming'
  );
}

export function extractReadableError(err: unknown): string {
  if (!err) return 'Unknown transaction error';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as { shortMessage?: string; message?: string; details?: string };
    const raw = obj.shortMessage || obj.details || obj.message || 'Transaction failed';
    if (raw.toLowerCase().includes('user rejected') || raw.toLowerCase().includes('user denied')) {
      return 'Transaction rejected in wallet';
    }
    return raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
  }
  return 'Transaction failed';
}
