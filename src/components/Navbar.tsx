import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { truncateAddress } from '../utils/format';
import { UglyfoxLogo } from './UglyfoxLogo';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore', end: false },
  { to: '/balance', label: 'My Balance', end: false },
  { to: '/provider', label: 'Provider', end: false },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-[3px] border-[#0D0D0D]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-4 sm:gap-8">
        <Link
          to="/"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group focus-visible:outline-none"
        >
          <UglyfoxLogo size={38} />
          <span className="text-2xl font-bold tracking-tight uppercase text-[#0D0D0D]">
            Uglyfox
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 lg:gap-8"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-2 py-1.5 text-sm font-bold uppercase tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#FFD60A] text-[#0D0D0D] border-b-[3px] border-[#0D0D0D]'
                    : 'text-[#0D0D0D] hover:bg-[#EDEDED]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              if (!ready) {
                return (
                  <button
                    type="button"
                    disabled
                    className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-4 py-2 text-xs sm:text-sm whitespace-nowrap shrink-0"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-4 py-2 text-xs sm:text-sm whitespace-nowrap shrink-0"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="brutal-btn bg-[#E6007A] text-[#FFFFFF] px-4 py-2 text-xs sm:text-sm whitespace-nowrap shrink-0"
                  >
                    Switch to Arc
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden sm:inline-flex items-center gap-2 brutal-btn-sm bg-[#FFFFFF] text-[#0D0D0D] px-3 py-2 text-xs whitespace-nowrap shrink-0"
                  >
                    <UglyfoxLogo size={16} />
                    <span>{chain.name || 'Arc'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="brutal-btn-sm bg-[#FFD60A] text-[#0D0D0D] px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap shrink-0 tabular-nums"
                  >
                    {account.displayName || truncateAddress(account.address)}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden brutal-btn-sm bg-[#FFFFFF] text-[#0D0D0D] p-2 shrink-0"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile"
          className="md:hidden border-t-[3px] border-[#0D0D0D] bg-[#FFFFFF] px-4 py-4 flex flex-col gap-2"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 border-[3px] border-[#0D0D0D] text-sm font-bold uppercase tracking-[0.06em] whitespace-nowrap ${
                  isActive ? 'bg-[#FFD60A] text-[#0D0D0D]' : 'bg-[#FFFFFF] text-[#0D0D0D]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
