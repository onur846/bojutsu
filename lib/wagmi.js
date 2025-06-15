import { createConfig, http } from 'wagmi'
import { walletConnect, injected } from 'wagmi/connectors'

// Your Katana Network
const katana = {
  id: 129399,
  name: 'Tatara Network (Katana Testnet)',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.tatara.katanarpc.com'] }
  },
  blockExplorers: {
    default: { name: 'Katana Explorer', url: 'https://explorer.tatara.katana.network' }
  }
}

export const config = createConfig({
  chains: [katana],
  connectors: [
    walletConnect({
      projectId: '39681bbf49eacfab90129b7821dc5a52',
      metadata: {
        name: 'Bojutsu DeFi Platform',
        description: 'Katana DeFi Platform with WalletConnect',
        url: 'https://bojutsu.vercel.app',
      },
      qrModalOptions: {
        themeMode: 'dark',
      }
    }),
    injected() // For MetaMask/browser wallets
  ],
  transports: {
    [katana.id]: http(),
  },
})
