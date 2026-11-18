import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIntegerCount, formatTokenAmount, truncateAddress } from '../utils/format';
import type { ServiceRecord } from '../utils/serviceFilter';

interface ServiceCardProps {
  service: ServiceRecord;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="brutal-card-interactive flex flex-col justify-between h-full">
      <div>
        <div className="bg-[#0D0D0D] text-[#FFFFFF] px-4 py-2.5 border-b-[3px] border-[#0D0D0D] flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FFD60A] tabular-nums">
            SERVICE #{service.id.toString()}
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
            {service.tokenSymbol} · {service.active ? 'ACTIVE' : 'PAUSED'}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          <h3 className="text-xl font-bold tracking-tight text-[#0D0D0D] leading-snug">
            {service.name}
          </h3>
          <p className="text-sm text-[#0D0D0D] leading-relaxed line-clamp-3">
            {service.description || 'No description provided'}
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t-[2px] border-[#0D0D0D] bg-[#EDEDED] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="label-caps text-[#0D0D0D]">Price per call</p>
            <p className="font-mono text-lg font-bold text-[#0D0D0D] tabular-nums mt-1">
              {formatTokenAmount(service.pricePerCall, service.tokenDecimals, 6)}{' '}
              {service.tokenSymbol}
            </p>
          </div>
          <div>
            <p className="label-caps text-[#0D0D0D]">Total calls</p>
            <p className="font-mono text-lg font-bold text-[#0D0D0D] tabular-nums mt-1">
              {formatIntegerCount(service.totalCalls)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="font-mono text-xs text-[#0D0D0D] tabular-nums">
            Provider {truncateAddress(service.provider)}
          </span>
          <Link
            to={`/service/${service.id.toString()}`}
            className="brutal-btn-sm bg-[#FFD60A] text-[#0D0D0D] px-3 py-1.5 text-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Inspect</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
