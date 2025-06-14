import '../styles/globals.css'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  mainnet, arbitrum, polygon, optimism, base, bsc,
  avalanche, fantom, zora, gnosis, linea, scroll, mantle
} from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import WalletConnectButton from '../components/WalletConnectButton'

const chains = [mainnet, arbitrum, polygon, optimism, base, bsc, avalanche, fantom, zora, gnosis, linea, scroll, mantle];

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId: '39681bbf49eacfab90129b7821dc5a52',
    }),
  ],
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, http()])
  )
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* Fixed Top Bar */}
        <div className="fixed top-0 left-0 w-full flex justify-end items-center p-4 bg-white z-20 shadow">
          <WalletConnectButton />
        </div>
        {/* Main Content with padding */}
        <div className="pt-20">
          <Component {...pageProps} />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
