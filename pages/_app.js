import "../styles/globals.css";
import { WagmiConfig, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

const config = createConfig({
  chains: [mainnet], 
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
