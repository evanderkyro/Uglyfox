import { useConnectModal } from '@rainbow-me/rainbowkit';
import { UglyfoxLogo } from './UglyfoxLogo';

interface WalletGateProps {
  title: string;
  description: string;
}

export function WalletGate({ title, description }: WalletGateProps) {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="brutal-card p-6 sm:p-10 bg-[#FFFFFF]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="border-[3px] border-[#0D0D0D] bg-[#FFD60A] p-2 shrink-0 self-start">
            <UglyfoxLogo size={40} />
          </div>
          <div className="space-y-2">
            <p className="label-caps text-[#0D0D0D]">Wallet required</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              {title}
            </h2>
            <p className="text-base text-[#0D0D0D] max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => openConnectModal?.()}
            className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-6 py-3.5 text-sm whitespace-nowrap"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
