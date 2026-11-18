import { formatUnits, parseUnits } from 'viem';

export function truncateAddress(address: string, head = 6, tail = 4): string {
  if (!address) return '';
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function formatTokenAmount(
  raw: bigint,
  decimals: number,
  maxFractionDigits = 4
): string {
  const formatted = formatUnits(raw, decimals);
  const [intPart, fracPart = ''] = formatted.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (maxFractionDigits === 0) {
    return withCommas;
  }

  const trimmed = fracPart.slice(0, maxFractionDigits).replace(/0+$/, '');
  if (!trimmed) {
    return `${withCommas}.${'0'.repeat(Math.min(2, maxFractionDigits))}`;
  }
  if (trimmed.length === 1 && maxFractionDigits >= 2) {
    return `${withCommas}.${trimmed}0`;
  }
  return `${withCommas}.${trimmed}`;
}

export function formatExactTokenAmount(raw: bigint, decimals: number): string {
  const formatted = formatUnits(raw, decimals);
  const [intPart, fracPart] = formatted.split('.');
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fracPart ? `${withCommas}.${fracPart}` : withCommas;
}

export function parseTokenAmountSafe(input: string, decimals: number): bigint | null {
  const cleaned = input.trim().replace(/,/g, '');
  if (!cleaned) return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;

  const parts = cleaned.split('.');
  if (parts[1] && parts[1].length > decimals) {
    return null;
  }

  try {
    return parseUnits(cleaned, decimals);
  } catch {
    return null;
  }
}

export function validateAmountInput(
  input: string,
  decimals: number,
  maxAllowed?: bigint
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return 'Enter an amount';

  const parsed = parseTokenAmountSafe(trimmed, decimals);
  if (parsed === null) {
    return `Enter a valid number with up to ${decimals} decimal places`;
  }
  if (parsed <= 0n) {
    return 'Amount must be greater than zero';
  }
  if (maxAllowed !== undefined && parsed > maxAllowed) {
    return 'Amount exceeds available balance';
  }
  return null;
}

export function formatIntegerCount(value: bigint | number): string {
  const num = typeof value === 'bigint' ? value : BigInt(Math.max(0, Math.floor(value)));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
