import { connectorsForWallets, lightTheme } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { arcChain, ARC_RPC_URL, getWalletConnectProjectId } from './arc';

const walletConnectId = getWalletConnectProjectId();

const walletGroup = walletConnectId
  ? [
      {
        groupName: 'Wallets',
        wallets: [
          injectedWallet,
          metaMaskWallet,
          rainbowWallet,
          coinbaseWallet,
          walletConnectWallet,
        ],
      },
    ]
  : [
      {
        groupName: 'Browser Wallets',
        wallets: [injectedWallet],
      },
    ];

const connectors = connectorsForWallets(walletGroup, {
  appName: 'Uglyfox',
  projectId: walletConnectId || '00000000000000000000000000000000',
});

export const wagmiConfig = createConfig({
  chains: [arcChain],
  connectors,
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: false,
});

export const uglyfoxRainbowTheme = lightTheme({
  accentColor: '#FFD60A',
  accentColorForeground: '#0D0D0D',
  borderRadius: 'none',
  fontStack: 'system',
  overlayBlur: 'none',
});
