import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContractConfigNotice } from '../components/ContractConfigNotice';
import { ServiceCard } from '../components/ServiceCard';
import { UglyfoxLogo } from '../components/UglyfoxLogo';
import {
  useContractAbi,
  usePlatformStats,
  useServicesList,
  useTokenMetadata,
} from '../hooks/useUglyfoxContract';
import { EURC_ADDRESS, USDC_ADDRESS } from '../config/arc';
import { formatIntegerCount, formatTokenAmount } from '../utils/format';

const ROADMAP_PHASES = [
  {
    phase: 'PHASE 1',
    status: 'LIVE',
    title: 'Phase 1 Core billing live',
    description:
      'Service registry, USDC and EURC prepaid deposits, provider usage metering, unused balance withdrawals, and earnings claims built on Arc.',
  },
  {
    phase: 'PHASE 2',
    status: 'NEXT',
    title: 'Phase 2 Usage receipts',
    description:
      'Signed per call receipts anchored to each deduction so developers and agents can verify every request independently.',
  },
  {
    phase: 'PHASE 3',
    status: 'PLANNED',
    title: 'Phase 3 Spending limits per service',
    description:
      'Per service budget caps and daily rate limits enforced directly in the billing contract before a call is accepted.',
  },
  {
    phase: 'PHASE 4',
    status: 'PLANNED',
    title: 'Phase 4 Agent wallets',
    description:
      'Scoped session permissions and automated top up rules so autonomous AI agents can pay for tools safely.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is a prepaid balance',
    answer:
      'A prepaid balance is USDC or EURC you deposit into the Uglyfox contract once. When you or your agent calls a listed API, the exact per call price is deducted from that balance instead of triggering a wallet signature on every request.',
  },
  {
    question: 'Who records my usage',
    answer:
      'The service provider records completed call counts against your wallet for their registered service. Only the provider address that owns a service can record usage for that service, and deductions are bounded by your prepaid balance.',
  },
  {
    question: 'Can I get unused funds back',
    answer:
      'Yes. Any portion of your prepaid balance that has not been spent on recorded calls stays yours. You can withdraw part or all of your unused balance back to your wallet at any time from My Balance.',
  },
  {
    question: 'How do providers get paid',
    answer:
      'Every recorded call moves the call fee from the caller prepaid balance into the provider claimable earnings balance inside the contract. Providers can claim accumulated USDC or EURC straight to their wallet from the Provider Dashboard.',
  },
];

export function HomePage() {
  const { contractConfigured } = useContractAbi();
  const statsQuery = usePlatformStats();
  const servicesQuery = useServicesList();
  const tokenMetaQuery = useTokenMetadata();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const usdcDecimals =
    tokenMetaQuery.data?.[USDC_ADDRESS.toLowerCase()]?.decimals ?? 6;
  const eurcDecimals =
    tokenMetaQuery.data?.[EURC_ADDRESS.toLowerCase()]?.decimals ?? 6;

  const stats = statsQuery.data;
  const services = servicesQuery.data ?? [];
  const featuredServices = services.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b-[3px] border-[#0D0D0D] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="lg:col-span-7 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-block brutal-chip bg-[#FFD60A] text-[#0D0D0D] px-3 py-1.5 text-xs -rotate-1">
                  Built on Arc · Pay per call
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-[-0.04em] leading-[1.04] text-[#0D0D0D] text-balance">
                  Pay per call billing built on Arc
                </h1>

                <p className="text-base sm:text-lg font-medium text-[#0D0D0D] max-w-2xl leading-relaxed">
                  Providers list APIs and AI agent tools with a fixed price per call. Users fund a prepaid USDC or EURC balance once, calls deduct per request, and providers claim what they earned.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/explore"
                  className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-6 py-4 text-sm inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/provider"
                  className="brutal-btn bg-[#FFFFFF] text-[#0D0D0D] hover:bg-[#EDEDED] px-6 py-4 text-sm whitespace-nowrap"
                >
                  Provider Dashboard
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="lg:col-span-5 flex"
            >
              <div className="brutal-card bg-[#FFD60A] w-full flex flex-col justify-between">
                <div className="bg-[#0D0D0D] text-[#FFFFFF] px-5 py-3 border-b-[3px] border-[#0D0D0D] flex items-center justify-between">
                  <span className="label-caps text-[#FFD60A]">Prepaid ledger flow</span>
                  <UglyfoxLogo size={24} />
                </div>

                <div className="p-6 space-y-4">
                  <div className="border-[3px] border-[#0D0D0D] bg-[#FFFFFF] p-4 space-y-1">
                    <p className="label-caps text-[#0D0D0D]">01 Top up once</p>
                    <p className="text-sm font-medium text-[#0D0D0D]">
                      Approve and deposit USDC or EURC into your prepaid balance on Arc.
                    </p>
                  </div>

                  <div className="border-[3px] border-[#0D0D0D] bg-[#FFFFFF] p-4 space-y-1">
                    <p className="label-caps text-[#0D0D0D]">02 Deduct per call</p>
                    <p className="text-sm font-medium text-[#0D0D0D]">
                      APIs and AI agents serve requests immediately with zero per call wallet popups.
                    </p>
                  </div>

                  <div className="border-[3px] border-[#0D0D0D] bg-[#FFFFFF] p-4 space-y-1">
                    <p className="label-caps text-[#0D0D0D]">03 Claim or withdraw</p>
                    <p className="text-sm font-medium text-[#0D0D0D]">
                      Providers claim earned fees anytime and users withdraw unused funds freely.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-[#0D0D0D] text-[#FFFFFF] border-t-[3px] border-[#0D0D0D] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase">Available on Arc</span>
                  <span className="font-mono text-xs font-bold text-[#FFD60A] tabular-nums">
                    CHAIN 5042002
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Platform Stats Strip */}
      <section className="border-b-[3px] border-[#0D0D0D] bg-[#EDEDED]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              Protocol activity on Arc
            </h2>
            <span className="font-mono text-xs uppercase text-[#0D0D0D]">
              {contractConfigured ? 'Live contract reads' : 'Waiting for contract address'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="brutal-card p-5 bg-[#FFFFFF]">
              <p className="label-caps text-[#0D0D0D]">Listed services</p>
              <p className="font-mono text-3xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                {statsQuery.isLoading
                  ? '...'
                  : formatIntegerCount(stats?.totalServices ?? 0n)}
              </p>
            </div>

            <div className="brutal-card p-5 bg-[#FFFFFF]">
              <p className="label-caps text-[#0D0D0D]">Recorded calls</p>
              <p className="font-mono text-3xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                {statsQuery.isLoading
                  ? '...'
                  : formatIntegerCount(stats?.totalCalls ?? 0n)}
              </p>
            </div>

            <div className="brutal-card p-5 bg-[#FFFFFF]">
              <p className="label-caps text-[#0D0D0D]">USDC billed</p>
              <p className="font-mono text-3xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                {statsQuery.isLoading
                  ? '...'
                  : `${formatTokenAmount(stats?.totalUsdcVolume ?? 0n, usdcDecimals)} USDC`}
              </p>
            </div>

            <div className="brutal-card p-5 bg-[#FFD60A]">
              <p className="label-caps text-[#0D0D0D]">EURC billed</p>
              <p className="font-mono text-3xl font-bold text-[#0D0D0D] tabular-nums mt-2">
                {statsQuery.isLoading
                  ? '...'
                  : `${formatTokenAmount(stats?.totalEurcVolume ?? 0n, eurcDecimals)} EURC`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listed Services Preview */}
      <section className="border-b-[3px] border-[#0D0D0D] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <p className="label-caps text-[#0D0D0D]">On chain catalog</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D0D]">
                Listed services
              </h2>
            </div>
            <Link
              to="/explore"
              className="brutal-btn-sm bg-[#FFFFFF] hover:bg-[#FFD60A] text-[#0D0D0D] px-4 py-2 text-xs inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <span>View all services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!contractConfigured ? (
            <ContractConfigNotice />
          ) : servicesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="brutal-card h-64 bg-[#EDEDED] animate-pulse" />
              ))}
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="brutal-card p-8 bg-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <p className="label-caps text-[#0D0D0D]">Empty catalog</p>
                <p className="text-lg font-bold text-[#0D0D0D]">
                  No services have been registered on this contract yet.
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  Connect a wallet and register the first API or AI agent service from the Provider Dashboard.
                </p>
              </div>
              <Link
                to="/provider"
                className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-sm whitespace-nowrap shrink-0"
              >
                Register Service
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredServices.map((svc) => (
                <ServiceCard key={svc.id.toString()} service={svc} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="border-b-[3px] border-[#0D0D0D] bg-[#FCF9F8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-block brutal-chip bg-[#FFD60A] text-[#0D0D0D] px-3 py-1 text-xs">
                About Uglyfox
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D0D] text-balance">
                How prepaid billing works
              </h2>
              <p className="text-base text-[#0D0D0D] leading-relaxed">
                Signing an on chain transaction for every single API request breaks automation and adds unnecessary friction. Uglyfox separates funding from usage so software and AI agents can move at normal network speed.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="brutal-card p-6 bg-[#FFFFFF] space-y-2">
                <p className="label-caps text-[#0D0D0D]">Why no per call signatures</p>
                <p className="text-sm sm:text-base text-[#0D0D0D] leading-relaxed">
                  You approve and deposit USDC or EURC once into your prepaid ledger. After that, your AI agent or backend calls APIs without waiting for wallet prompts on every call.
                </p>
              </div>

              <div className="brutal-card p-6 bg-[#FFFFFF] space-y-2">
                <p className="label-caps text-[#0D0D0D]">Deterministic accounting</p>
                <p className="text-sm sm:text-base text-[#0D0D0D] leading-relaxed">
                  Each service locks its price per call and settlement token in the contract. Usage deductions move funds directly from caller balance to provider claimable earnings.
                </p>
              </div>

              <div className="brutal-card p-6 bg-[#FFFFFF] space-y-2">
                <p className="label-caps text-[#0D0D0D]">Full user custody</p>
                <p className="text-sm sm:text-base text-[#0D0D0D] leading-relaxed">
                  Unused funds remain withdrawable at any time. You never lock capital inside a proprietary SaaS account or lose unspent credits.
                </p>
              </div>

              <div className="brutal-card p-6 bg-[#FFD60A] space-y-2">
                <p className="label-caps text-[#0D0D0D]">Direct provider settlement</p>
                <p className="text-sm sm:text-base text-[#0D0D0D] leading-relaxed">
                  Providers set transparent unit pricing in USDC or EURC and claim earned balances on demand from their own wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="border-b-[3px] border-[#0D0D0D] bg-[#FFFFFF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
          <div className="space-y-2 mb-8">
            <p className="label-caps text-[#0D0D0D]">Build sequence</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D0D]">
              Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROADMAP_PHASES.map((item, index) => (
              <div key={item.phase} className="brutal-card flex flex-col justify-between bg-[#FFFFFF]">
                <div>
                  <div
                    className={`px-4 py-2.5 border-b-[3px] border-[#0D0D0D] flex items-center justify-between ${
                      index === 0 ? 'bg-[#FFD60A] text-[#0D0D0D]' : 'bg-[#0D0D0D] text-[#FFFFFF]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase">{item.phase}</span>
                    <span className="font-mono text-xs font-bold uppercase">{item.status}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold tracking-tight text-[#0D0D0D]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#0D0D0D] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#EDEDED]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-2">
              <p className="label-caps text-[#0D0D0D]">Answers</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0D0D0D]">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.question} className="brutal-card bg-[#FFFFFF]">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className={`w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors ${
                        isOpen ? 'bg-[#FFD60A]' : 'bg-[#FFFFFF] hover:bg-[#EDEDED]'
                      }`}
                    >
                      <h3 className="text-base sm:text-lg font-bold text-[#0D0D0D]">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-[#0D0D0D] transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 py-4 border-t-[3px] border-[#0D0D0D] bg-[#FFFFFF]">
                        <p className="text-sm sm:text-base text-[#0D0D0D] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
