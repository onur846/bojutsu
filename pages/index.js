import WalletConnectButton from "../components/WalletConnectButton";
import { useState } from "react";
const TOKENS = [
  { symbol: "WETH", address: "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4", name: "Wrapped Ether" },
  { symbol: "AUSD", address: "0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC", name: "Agora USD" },
  { symbol: "USDC", address: "0x102E14ffF48170F2e5b6d0e30259fCD4eE5E28aE", name: "USD Coin" },
  { symbol: "USDT", address: "0xDe51Ef59663e79B494E1236551187399D3359C92", name: "Tether USD" },
  { symbol: "USDS", address: "0xD416d04845d299bCC0e5105414C99fFc88f0C97d", name: "USD Stablecoin" },
  { symbol: "WBTC", address: "0x1538aDF273f6f13CcdcdBa41A5ce4b2DC2177D1C", name: "Wrapped Bitcoin" },
  { symbol: "uBTC", address: "0xB295FDad3aD8521E9Bc20CAeBB36A4258038574e", name: "Universal Bitcoin" },
  { symbol: "uSOL", address: "0x79b2417686870EFf463E37a1cA0fDA1c7e2442cE", name: "Universal Solana" },
  { symbol: "uXRP", address: "0x26435983DF976A02C55aC28e6F67C6477bBd95E7", name: "Universal Ripple" },
];

// Real Yearn Vaults on Katana Testnet
const REAL_VAULTS = [
  {
    name: "AUSD",
    underlying: "AUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    apy: "12.50%",
    tvl: "1,250.00 AUSD",
    explorer: "https://explorer.tatara.katana.network/address/0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
  },
  {
    name: "WETH",
    underlying: "WETH",
    address: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
    apy: "8.75%",
    tvl: "45.32 WETH",
    explorer: "https://explorer.tatara.katana.network/address/0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
  },
];

// Realistic vault names based on DeFi strategies
const VAULT_STRATEGIES = [
  "Curve", "Convex", "Aura", "Balancer", "Compound", "Aave", "Morpho",
  "Uniswap", "Sushi", "Vertex", "Arbitrum", "Optimism", "Base", "Polygon",
  "Lido", "Rocket", "Frax", "Maker", "Synthetix", "Curve3Pool", "TriCrypto",
  "StableSwap", "MetaPool", "Boosted", "Leveraged", "Delta", "Gamma", "Alpha"
];

// Additional mock vaults to fill the grid
const MOCK_VAULTS = Array.from({ length: 48 }, (_, i) => {
  const token = TOKENS[i % TOKENS.length];
  const strategy = VAULT_STRATEGIES[i % VAULT_STRATEGIES.length];
  const vaultName = `${token.symbol}-${strategy}`;
  
  return {
    name: vaultName,
    underlying: token.symbol,
    address: `0x${(i + 3).toString().padStart(40, "0")}`,
    apy: `${(8 + (i % 7)).toFixed(2)}%`,
    tvl: `${(Math.random() * 5000 + 100).toFixed(2)} ${token.symbol}`,
    explorer: `https://explorer.tatara.katana.network/address/0x${(i + 3).toString().padStart(40, "0")}`,
  };
});

const VAULTS = [...REAL_VAULTS, ...MOCK_VAULTS];

const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  rpc: "https://rpc.tatara.katanarpc.com", // Requires /<apikey> for actual use
  explorer: "https://explorer.tatara.katana.network/",
  faucet: "https://faucet-api.polygon.technology/api-docs/",
  bridge: "https://portal-staging.polygon.technology/bridge",
  bridgeContract: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
  bridgeAPI: "https://bridge.tatara.katanarpc.com",
  native: "ETH",
  blockTime: 1, // 1 second
  gasLimit: 60000000, // 60M units
  gasPricing: "EIP1559",
  dataAvailability: "EIP4844",
};

function copyToClipboard(str) {
  navigator.clipboard.writeText(str);
}

export default function Home() {
  const [modal, setModal] = useState({ open: false, vault: null, type: null });

  return (
    <div
      className="min-h-screen bg-[#0d101a] flex flex-col"
      style={{
        backgroundImage: "url('/bojutsu-bg.png')",
        backgroundSize: "100vw 100vh",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header with Connect Wallet in top right */}
      <div className="relative w-full pt-6 pb-10">
        {/* Connect Wallet Button - Fixed to top right */}
        <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
          <WalletConnectButton />
          
          {/* Testnet Quickstart Card - Right under wallet button */}
          <div 
            className="mt-3 bg-[#1c2230cc] rounded-xl shadow-lg border border-[#292d3e] flex items-center justify-center p-3"
            style={{
              width: "4.8cm",
              height: "2.5cm",
              minWidth: "4.8cm",
              minHeight: "2.5cm",
              maxWidth: "4.8cm",
              maxHeight: "2.5cm"
            }}
          >
            <div className="w-full h-full flex flex-col justify-center">
              <div className="text-white font-semibold text-lg mb-1 leading-tight">⚔️ Quickstart</div>
              <div className="flex flex-col text-sm space-y-0.5">
                <a
                  href="#"
                  className="text-blue-300 hover:underline"
                  onClick={() => {
                    if (window.ethereum) {
                      window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                          chainId: "0x1f971",
                          chainName: KATANA_CHAIN.name,
                          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                          rpcUrls: [KATANA_CHAIN.rpc],
                          blockExplorerUrls: [KATANA_CHAIN.explorer],
                        }]
                      }).catch((err) => { });
                    }
                  }}
                >
                  Add Katana Testnet
                </a>
                <a href={KATANA_CHAIN.faucet} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  Get Test ETH (Faucet)
                </a>
                <a href={KATANA_CHAIN.bridge} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  Bridge Test Assets
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Title */}
        <div className="pt-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center">Katana Vault Aggregator</h1>
        </div>
      </div>

      {/* Vaults as Cards */}
      <div className="flex flex-1 justify-center items-start" style={{ marginTop: "7cm" }}>
        <div className="w-full max-w-7xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {VAULTS.map((vault) => (
              <div
                key={vault.address}
                className="bg-[#181c26cc] rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="text-lg font-bold text-white mb-1">{vault.name}</div>
                  <div className="text-sm text-gray-400 mb-2">Underlying: {vault.underlying}</div>
                  <div className="flex gap-4 mb-4">
                    <span className="text-green-400 font-mono">APY: {vault.apy}</span>
                    <span className="text-blue-200 font-mono">TVL: {vault.tvl}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                    onClick={() => setModal({ open: true, vault, type: "deposit" })}
                  >Deposit</button>
                  <button
                    className="bg-red-700 hover:bg-red-800 text-white text-xs px-2 py-1 rounded"
                    onClick={() => setModal({ open: true, vault, type: "withdraw" })}
                  >Withdraw</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal UI */}
      {modal.open && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="bg-[#222537] rounded-2xl p-8 shadow-2xl w-full max-w-xs flex flex-col items-center">
            <h2 className="text-lg text-white mb-2 font-bold">
              {modal.type === "deposit" ? "Deposit to" : "Withdraw from"} {modal.vault.name}
            </h2>
            <div className="text-xs text-gray-300 mb-2">
              Vault: <span className="font-mono">{modal.vault.address}</span>
              <button
                onClick={() => copyToClipboard(modal.vault.address)}
                className="ml-1 text-blue-400 hover:underline">Copy</button>
            </div>
            <input
              type="number"
              min="0"
              placeholder="Amount"
              className="mb-4 px-3 py-2 rounded w-full outline-none bg-[#181c26] text-white"
              disabled
            />
            <div className="flex gap-3">
              <button
                className="px-4 py-1 bg-blue-700 rounded text-white"
                disabled
                title="Not live yet"
              >
                {modal.type === "deposit" ? "Deposit" : "Withdraw"}
              </button>
              <button
                className="px-4 py-1 bg-gray-500 rounded text-white"
                onClick={() => setModal({ open: false, vault: null, type: null })}
              >
                Cancel
              </button>
            </div>
            <div className="text-xs mt-3 text-yellow-300">Testnet RPC/API key required for live actions.</div>
          </div>
        </div>
      )}

      <footer className="text-center mt-12 mb-8 text-gray-400">
        Powered by @pelenko
      </footer>
    </div>
  );
}
