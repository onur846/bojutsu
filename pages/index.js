import WalletConnectButton from "../components/WalletConnectButton";
import { useState } from "react";

const VAULTS = Array.from({ length: 50 }, (_, i) => ({
  name: `yvVAULT${i + 1}`,
  underlying: ["WETH", "AUSD", "WBTC", "USDT", "USDS"][i % 5],
  address: `0x${(i + 1).toString().padStart(40, "0")}`,
  apy: `${(10 + (i % 5)).toFixed(2)}%`,
  tvl: `${(Math.random() * 10000).toFixed(2)} ${["WETH", "AUSD", "WBTC", "USDT", "USDS"][i % 5]}`,
  explorer: `https://explorer.tatara.katana.network/address/0x${(i + 1).toString().padStart(40, "0")}`,
}));

const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  rpc: "https://rpc.tatara.katanarpc.com/demo",
  explorer: "https://explorer.tatara.katana.network/",
  faucet: "https://faucet-api.polygon.technology/api-docs/",
  bridge: "https://portal-staging.polygon.technology/bridge",
  native: "ETH",
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
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Header bar */}
      <div className="relative w-full pt-14 pb-10 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white text-center w-full">Katana Vault Aggregator</h1>
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <WalletConnectButton />
        </div>
      </div>

      {/* Quickstart Section */}
      <div className="mx-auto mb-8 w-full max-w-2xl">
        <div className="bg-[#1c2230cc] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 border border-[#292d3e]">
          <div>
            <div className="text-white font-semibold text-lg mb-1">🧪 Testnet Quickstart</div>
            <div className="flex flex-wrap gap-3 text-sm mb-1">
              <a href={KATANA_CHAIN.faucet} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Get Test ETH (Faucet)</a>
              <a href={KATANA_CHAIN.bridge} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Bridge Test Assets</a>
              <a
                href="#"
                className="text-blue-300 hover:underline"
                onClick={() => {
                  if (window.ethereum) {
                    window.ethereum.request({
                      method: "wallet_addEthereumChain",
                      params: [{
                        chainId: "0x1f971", // 129399 decimal = 0x1f971
                        chainName: KATANA_CHAIN.name,
                        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                        rpcUrls: [KATANA_CHAIN.rpc],
                        blockExplorerUrls: [KATANA_CHAIN.explorer],
                      }]
                    }).catch((err) => {
                      // Optionally, handle user rejection or errors here
                    });
                  }
                }}
              >
                Add Katana Testnet to MetaMask
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Vaults as Cards */}
      <div className="flex flex-1 justify-center items-start mt-10">
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
                  <div className="flex gap-4 mb-2">
                    <span className="text-green-400 font-mono">APY: {vault.apy}</span>
                    <span className="text-blue-200 font-mono">TVL: {vault.tvl}</span>
                  </div>
                  <div className="text-xs text-gray-300 break-all mb-3">
                    <span>Vault: </span>{vault.address}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={vault.explorer} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">Explorer</a>
                  <button
                    className="text-blue-400 hover:underline text-xs"
                    onClick={() => copyToClipboard(vault.address)}
                  >Copy</button>
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
