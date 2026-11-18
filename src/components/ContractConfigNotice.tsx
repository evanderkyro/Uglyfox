import { UglyfoxLogo } from './UglyfoxLogo';

interface ContractConfigNoticeProps {
  compact?: boolean;
}

export function ContractConfigNotice({ compact = false }: ContractConfigNoticeProps) {
  return (
    <div
      className={`border-[3px] border-[#0D0D0D] bg-[#EDEDED] shadow-[6px_6px_0px_#0D0D0D] ${
        compact ? 'p-4' : 'p-6 sm:p-8'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="shrink-0 self-start">
          <UglyfoxLogo size={compact ? 28 : 36} />
        </div>
        <div className="space-y-1.5">
          <p className="label-caps text-[#0D0D0D]">Contract awaiting address</p>
          <p className="text-sm sm:text-base font-medium text-[#0D0D0D] leading-relaxed">
            No Uglyfox billing contract address is configured for this deployment yet. Once a deployed Arc contract address is connected, live services, balances, and usage appear here automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
