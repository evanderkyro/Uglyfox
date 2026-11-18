import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContractConfigNotice } from '../components/ContractConfigNotice';
import { ServiceCard } from '../components/ServiceCard';
import { useContractAbi, useServicesList } from '../hooks/useUglyfoxContract';
import {
  filterAndSortServices,
  type ServiceSort,
  type TokenFilter,
} from '../utils/serviceFilter';

const TOKEN_FILTERS: Array<{ value: TokenFilter; label: string }> = [
  { value: 'ALL', label: 'All Tokens' },
  { value: 'USDC', label: 'USDC' },
  { value: 'EURC', label: 'EURC' },
];

export function ExplorePage() {
  const { contractConfigured } = useContractAbi();
  const servicesQuery = useServicesList();

  const [query, setQuery] = useState('');
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>('ALL');
  const [sortBy, setSortBy] = useState<ServiceSort>('newest');

  const filtered = useMemo(() => {
    return filterAndSortServices(servicesQuery.data ?? [], query, tokenFilter, sortBy);
  }, [servicesQuery.data, query, tokenFilter, sortBy]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b-[3px] border-[#0D0D0D] pb-6">
        <div className="space-y-2">
          <p className="label-caps text-[#0D0D0D]">Service directory on Arc</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0D0D0D]">
            Explore services
          </h1>
        </div>

        <Link
          to="/provider"
          className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-xs sm:text-sm self-start md:self-auto whitespace-nowrap"
        >
          List a Service
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="brutal-card p-4 sm:p-6 bg-[#FFFFFF] space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-6 space-y-1.5">
            <label htmlFor="service-search" className="label-caps block text-[#0D0D0D]">
              Search services
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#0D0D0D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="service-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, description, ID, or provider"
                className="brutal-input w-full pl-10 pr-4 py-2.5 text-sm font-medium"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-1.5">
            <span className="label-caps block text-[#0D0D0D]">Settlement token</span>
            <div className="flex border-[3px] border-[#0D0D0D] bg-[#EDEDED]">
              {TOKEN_FILTERS.map((item) => {
                const active = tokenFilter === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTokenFilter(item.value)}
                    className={`flex-1 px-3 py-2.5 font-mono text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-[#FFD60A] text-[#0D0D0D]'
                        : 'bg-[#FFFFFF] text-[#0D0D0D] hover:bg-[#EDEDED]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-1.5">
            <label htmlFor="service-sort" className="label-caps block text-[#0D0D0D]">
              Sort order
            </label>
            <select
              id="service-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ServiceSort)}
              className="brutal-input w-full px-3 py-2.5 text-sm font-bold"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Lowest price per call</option>
              <option value="price_desc">Highest price per call</option>
              <option value="calls_desc">Most recorded calls</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Area */}
      {!contractConfigured ? (
        <ContractConfigNotice />
      ) : servicesQuery.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="brutal-card h-64 bg-[#EDEDED] animate-pulse" />
          ))}
        </div>
      ) : servicesQuery.isError ? (
        <div className="brutal-card p-8 bg-[#FFFFFF] space-y-4">
          <p className="label-caps text-[#0D0D0D]">Contract read error</p>
          <p className="text-base font-medium text-[#0D0D0D]">
            Could not read services from Arc RPC. Check your network connection and retry.
          </p>
          <button
            type="button"
            onClick={() => servicesQuery.refetch()}
            className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-2.5 text-xs"
          >
            Retry Read
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="brutal-card p-8 sm:p-10 bg-[#EDEDED] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <p className="label-caps text-[#0D0D0D]">No matching services</p>
            <p className="text-xl font-bold text-[#0D0D0D]">
              {(servicesQuery.data?.length ?? 0) === 0
                ? 'No services are registered on the contract yet.'
                : 'No services match your current search or token filter.'}
            </p>
            <p className="text-sm text-[#0D0D0D]">
              {(servicesQuery.data?.length ?? 0) === 0
                ? 'Providers can list a new pay per call service in seconds.'
                : 'Clear your search filters to view all available services.'}
            </p>
          </div>

          {(servicesQuery.data?.length ?? 0) === 0 ? (
            <Link
              to="/provider"
              className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-sm whitespace-nowrap shrink-0"
            >
              Register First Service
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setTokenFilter('ALL');
              }}
              className="brutal-btn bg-[#FFD60A] text-[#0D0D0D] px-5 py-3 text-sm whitespace-nowrap shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((svc) => (
            <ServiceCard key={svc.id.toString()} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
