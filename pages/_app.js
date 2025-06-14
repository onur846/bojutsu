import '../styles/globals.css'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  mainnet, arbitrum, polygon, optimism, base, bsc,
  avalanche, fantom, zora, gnosis, linea, scroll, mantle
} from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const queryClient = new QueryClient()

const chains = [
  mainnet, arbitrum, polygon, optimism, base, bsc,
  avalanche, fantom, zora, gnosis, linea, scroll, mantle
]

const wagmiConfig = createConfig({
  chains,
  connectors: [injected()],
  transports: Object.fromEntries(
    chains.map((chain) => [chain.id, http()])
  )
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiConfig>
  )
}
