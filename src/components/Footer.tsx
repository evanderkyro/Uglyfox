import { Link } from 'react-router-dom';
import { ARC_CHAIN_ID, ARC_EXPLORER_URL } from '../config/arc';
import { UglyfoxLogo } from './UglyfoxLogo';

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-[#FFFFFF] border-t-[3px] border-[#0D0D0D] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-8 border-b-[2px] border-[#313030]">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3">
              <UglyfoxLogo size={36} />
              <span className="text-xl font-bold uppercase tracking-tight text-[#FFFFFF]">
                Uglyfox
              </span>
            </Link>
            <p className="text-sm text-[#EDEDED] max-w-xs leading-relaxed">
              Pay per call billing built on Arc for APIs and AI agents
            </p>
          </div>

          <div className="space-y-3">
            <p className="label-caps text-[#FFD60A]">Navigation</p>
            <ul className="grid grid-cols-2 gap-2 text-sm font-medium">
              <li>
                <Link to="/" className="hover:text-[#FFD60A] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#FFD60A] transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/balance" className="hover:text-[#FFD60A] transition-colors">
                  My Balance
                </Link>
              </li>
              <li>
                <Link to="/provider" className="hover:text-[#FFD60A] transition-colors">
                  Provider
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="label-caps text-[#FFD60A]">Network</p>
            <div className="font-mono text-xs space-y-1.5 text-[#EDEDED]">
              <p>Built on Arc · Chain ID {ARC_CHAIN_ID}</p>
              <p>Settlement · USDC and EURC</p>
              <a
                href={ARC_EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block underline underline-offset-4 text-[#FFD60A] hover:text-[#FFFFFF]"
              >
                View on Arcscan
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-mono text-sm font-bold text-[#FFD60A] uppercase tracking-wider">
            Built by Evander
          </p>
          <p className="text-xs sm:text-sm text-[#FFFFFF]">
            Uglyfox is a one person project, available on Arc.
          </p>
        </div>
      </div>
    </footer>
  );
}
