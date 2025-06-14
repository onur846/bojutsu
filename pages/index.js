import WalletConnectButton from "../components/WalletConnectButton";
import { useState } from "react";

const VAULTS = [
  {
    name: "yvWETH",
    underlying: "WETH",
    address: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
    apy: "13.00%",   // Mock for now
    tvl: "1,234.56 WETH", // Mock for now
    explorer: "https://explorer.tatara.katana.network/address/0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
  },
  {
    name: "yvAUSD",
    underlying: "AUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    apy: "8.90%",
    tvl: "9,876.54 AUSD",
    explorer: "https://explorer.tatara.katana.network/address/0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
  }
];

const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
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
    <div className="min-h-screen bg-[#0d101a] flex flex-col" style={{
      backgroundImage: "url('/bojutsu-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
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
            <div className="text-sm text-gray-300 mb-2">
              <span>RPC: </span>
              <span className="font-mono">{KATANA_CHAIN.rpc.replace("<your_api_key>", "••••••••")}</span>
              <button
                onClick={() => copyToClipboard(KATANA_CHAIN.rpc)}
                className="ml-2 text-blue-400 hover:underline text-xs">Copy</button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <a href={KATANA_CHAIN.faucet} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Get Test ETH (Faucet)</a>
              <a href={KATANA_CHAIN.bridge} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Bridge Test Assets</a>
              <a href="#" className="text-blue-300 hover:underline"
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
                    });
                  }
                }}>
                Add Katana Testnet to MetaMask
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-start mt-10">
        <div className="bg-[#181c26cc] rounded-2xl p-10 shadow-lg min-w-[600px]">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2">Vault</th>
                <th className="pb-2">Underlying</th>
                <th className="pb-2">APY</th>
                <th className="pb-2">TVL</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {VAULTS.map((vault) => (
                <tr key={vault.name} className="border-b border-gray-800">
                  <td className="py-2">{vault.name}</td>
                  <td>{vault.underlying}</td>
                  <td>{vault.apy}</td>
                  <td>{vault.tvl}</td>
                  <td className="flex gap-2">
                    <a href={vault.explorer} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-xs">Explorer</a>
                    <button
                      className="text-blue-400 hover:underline text-xs"
                      onClick={() => copyToClipboard(vault.address)}>
                      Copy
                    </button>
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white text-xs px-2 py-1 rounded"
                      onClick={() => setModal({ open: true, vault, type: "deposit" })}>
                      Deposit
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white text-xs px-2 py-1 rounded"
                      onClick={() => setModal({ open: true, vault, type: "withdraw" })}>
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
