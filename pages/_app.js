import '../styles/globals.css'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  mainnet, arbitrum, polygon, optimism, base, bsc,
  avalanche, fantom, zora, gnosis, linea, scroll, mantle
} from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'

const queryClient = new QueryClient()

const chains = [
  mainnet, arbitrum, polygon, optimism, base, bsc,
  avalanche, fantom, zora, gnosis, linea, scroll, mantle
]

const wagmiConfig = createConfig({
  chains,
  connectors: [new InjectedConnector({ chains })],
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, http()])
  )
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
