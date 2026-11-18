import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { Layout } from './components/Layout';
import { uglyfoxRainbowTheme, wagmiConfig } from './config/wagmi';
import { ExplorePage } from './pages/ExplorePage';
import { HomePage } from './pages/HomePage';
import { MyBalancePage } from './pages/MyBalancePage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFoundPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
      <div className="brutal-card p-8 sm:p-12 bg-[#FFFFFF] max-w-xl space-y-5">
        <p className="label-caps text-[#0D0D0D]">404</p>
        <h1 className="text-4xl font-bold tracking-tight text-[#0D0D0D]">
          Page not found
        </h1>
        <p className="text-base text-[#0D0D0D]">
          The page you requested does not exist on Uglyfox.
        </p>
        <Link
          to="/"
          className="brutal-btn inline-block bg-[#FFD60A] text-[#0D0D0D] px-6 py-3 text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={uglyfoxRainbowTheme}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/balance" element={<MyBalancePage />} />
                <Route path="/provider" element={<ProviderDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
