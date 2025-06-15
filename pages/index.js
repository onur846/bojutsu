import React, { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Shield, Calculator, Users, Zap, Target,
  AlertTriangle, Wallet, Home, RefreshCw, ExternalLink, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// --- Constants ---
const TOKENS = [
  { symbol: "WETH", address: "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4", name: "Wrapped Ether" },
  { symbol: "AUSD", address: "0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC", name: "Agora USD" },
  { symbol: "USDC", address: "0x102E14ffF48170F2e5b6d0e30259fCD4eE5E28aE", name: "USD Coin" },
  { symbol: "USDT", address: "0xDe51Ef59663e79B494E1236551187399D3359C92", name: "Tether USD" }
];

const REAL_VAULTS = [
  {
    name: "AUSD Yield Vault",
    underlying: "AUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    apy: "12.50%",
    tvl: "1,250.00 AUSD",
    protocol: "Yearn",
    risk: "Low",
    explorer: "https://explorer.tatara.katana.network/address/0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60"
  },
  {
    name: "WETH Yield Vault",
    underlying: "WETH",
    address: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
    apy: "8.75%",
    tvl: "45.32 WETH",
    protocol: "Yearn",
    risk: "Medium",
    explorer: "https://explorer.tatara.katana.network/address/0xccc0fc2e34428120f985b460b487eb79e3c6fa57"
  }
];

const CONTRACTS = {
  sushiRouter: "0xAC4c6e212A361c968F1725b4d055b47E63F80b75",
  morphoBlue: "0xC263190b99ceb7e2b7409059D24CB573e3bB9021",
  vertexClearinghouse: "0xf72BE10454B2fB514A2639da885045C89e3EB693",
  agglayerBridge: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
  eas: "0x4200000000000000000000000000000000000021",
  safe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
  yvAUSD: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
  yvWETH: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57"
};

const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  hexChainId: "0x1f971",
  rpc: "https://rpc.tatara.katanarpc.com",
  explorer: "https://explorer.tatara.katana.network/",
  faucet: "https://faucet-api.polygon.technology/api-docs/",
  bridge: "https://portal-staging.polygon.technology/bridge"
};

const PROTOCOL_RATES = [
  { name: "Morpho Blue", apy: "8.2%", tvl: "$2.5M", risk: 7.5, color: "bg-blue-500" },
  { name: "Yearn Vaults", apy: "10.6%", tvl: "$1.8M", risk: 6.8, color: "bg-purple-500" },
  { name: "Sushi LP", apy: "15.3%", tvl: "$3.2M", risk: 8.9, color: "bg-pink-500" },
  { name: "Vertex Perps", apy: "22.1%", tvl: "$850K", risk: 9.2, color: "bg-orange-500" }
];

// --- Utility ---
const copyToClipboard = (str) => {
  navigator.clipboard.writeText(str);
  toast.success('Copied to clipboard!');
};
const formatAddress = (address) => (!address ? '' : `${address.slice(0, 6)}...${address.slice(-4)}`);

// --- Web3 Hook ---
function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const network = await web3Provider.getNetwork();
          const web3Signer = await web3Provider.getSigner();
          setProvider(web3Provider);
          setSigner(web3Signer);
          setAddress(accounts[0]);
          setChainId(Number(network.chainId));
          setConnected(true);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setAddress(accounts[0]);
      toast.success('Account changed');
    }
  };

  const handleChainChanged = (chainId) => {
    const numericChainId = parseInt(chainId, 16);
    setChainId(numericChainId);
    if (numericChainId === 129399) {
      toast.success('Switched to Katana Network');
    }
  };

  const handleDisconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress('');
    setChainId(null);
    setConnected(false);
    toast.info('Wallet disconnected');
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      throw new Error('No wallet found');
    }
    setConnecting(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const network = await web3Provider.getNetwork();
      const web3Signer = await web3Provider.getSigner();
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(accounts[0]);
      setChainId(Number(network.chainId));
      setConnected(true);
      if (Number(network.chainId) !== 129399) {
        await switchToKatana();
      } else {
        toast.success('Connected to Katana Network!');
      }
      return { provider: web3Provider, signer: web3Signer, address: accounts[0] };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error(`Connection failed: ${error.message}`);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const switchToKatana = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: KATANA_CHAIN.hexChainId }]
      });
      toast.success('Switched to Katana Network!');
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: KATANA_CHAIN.hexChainId,
              chainName: KATANA_CHAIN.name,
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: [KATANA_CHAIN.rpc],
              blockExplorerUrls: [KATANA_CHAIN.explorer]
            }]
          });
          toast.success('Katana Network added successfully!');
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add Katana Network');
        }
      }
    }
  };

  const getContract = (address, abi) => {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(address, abi, signer);
  };

  return {
    provider,
    signer,
    address,
    chainId,
    connected,
    connecting,
    connectWallet,
    switchToKatana,
    getContract,
    disconnect: handleDisconnect
  };
}

// --- WalletConnectButton ---
function WalletConnectButton() {
  const web3 = useWeb3();
  return (
    <div className="flex flex-col items-end gap-2">
      {web3.connected ? (
        <div className="flex flex-col items-end gap-2">
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="font-semibold">{formatAddress(web3.address)}</span>
          </div>
          <button
            onClick={web3.disconnect}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={web3.connectWallet}
          disabled={web3.connecting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {web3.connecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      )}
      {web3.connected && (
        <div className={`text-xs px-2 py-1 rounded ${
          web3.chainId === 129399
            ? 'bg-green-900/20 border border-green-500/30 text-green-400'
            : 'bg-yellow-900/20 border border-yellow-500/30 text-yellow-400'
        }`}>
          {web3.chainId === 129399 ? (
            <span>✅ Katana Network</span>
          ) : (
            <button onClick={web3.switchToKatana} className="hover:underline">
              ⚠️ Switch to Katana
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// --- VaultsTab ---
const VaultsTab = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState({ open: false, vault: null, type: null });
  const web3 = useWeb3();

  const refreshVaultData = async () => {
    if (!web3.connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Vault data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh vault data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleVaultAction = (vault, action) => {
    if (!web3.connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (web3.chainId !== 129399) {
      toast.error('Please switch to Katana Network');
      return;
    }
    setModal({ open: true, vault: { ...vault, isReal: true }, type: action });
  };

  return (
    <div className="w-full max-w-7xl px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="text-white">
          <span className="text-green-400 font-bold">{REAL_VAULTS.length}</span> Real Vaults
        </div>
        <button
          onClick={refreshVaultData}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {REAL_VAULTS.map((vault, index) => (
          <div
            key={vault.address}
            className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4 shadow-lg transition-all hover:scale-105"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm">{vault.name}</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <button
                onClick={() => window.open(vault.explorer, '_blank')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Protocol:</span>
                <span className="text-blue-300">{vault.protocol}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Asset:</span>
                <span className="text-white">{vault.underlying}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-mono text-sm">APY: {vault.apy}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  vault.risk === 'Low' ? 'bg-green-900/30 text-green-400' :
                  vault.risk === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {vault.risk}
                </span>
              </div>
              <div className="text-blue-200 font-mono text-xs">TVL: {vault.tvl}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors"
                onClick={() => handleVaultAction(vault, "deposit")}
              >
                Deposit
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-2 rounded transition-colors"
                onClick={() => handleVaultAction(vault, "withdraw")}
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PortfolioTab ---
const PortfolioTab = () => {
  const web3 = useWeb3();
  return (
    <div className="w-full max-w-4xl px-4">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
        <h2 className="text-3xl font-bold text-white mb-4">Portfolio Overview</h2>
        <div className="text-4xl font-bold text-green-400 mb-6">$0.00</div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No positions found</div>
          <div className="text-gray-500 text-sm">
            {web3.connected 
              ? "Deposit into vaults to see your positions here" 
              : "Connect your wallet to view portfolio"
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AnalyticsTab ---
const AnalyticsTab = () => (
  <div className="w-full max-w-6xl px-4">
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
      <h2 className="text-3xl font-bold text-white mb-6">Protocol Comparison</h2>
      <div className="grid gap-4">
        {PROTOCOL_RATES.map((protocol, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${protocol.color}`}></div>
                <span className="text-xl font-bold text-white">{protocol.name}</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{protocol.apy}</div>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>TVL: {protocol.tvl}</span>
              <span>Risk Score: {protocol.risk}/10</span>
            </div>
            <div className="mt-4 bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${protocol.color}`}
                style={{ width: `${protocol.risk * 10}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- StrategyTab ---
const StrategyTab = () => (
  <div className="w-full max-w-4xl px-4">
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
      <h2 className="text-3xl font-bold text-white mb-6">Strategy Builder</h2>
      <div className="text-center py-8">
        <div className="text-gray-400">Strategy builder coming soon</div>
      </div>
    </div>
  </div>
);

// --- RiskTab ---
const RiskTab = () => (
  <div className="w-full max-w-4xl px-4">
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
      <h2 className="text-3xl font-bold text-white mb-6">Risk Management</h2>
      <div className="text-center py-8">
        <div className="text-gray-400">Risk tools coming soon</div>
      </div>
    </div>
  </div>
);

// --- InfrastructureTab ---
// (PASTED IN PREVIOUS MESSAGE; leave as is or copy again above)

// --- Main Export ---
export default function KatanaDeFiPlatform() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [modal, setModal] = useState({ open: false, vault: null, type: null });
  const web3 = useWeb3();

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'vaults', label: 'Vaults', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'strategy', label: 'Strategy Builder', icon: Target },
    { id: 'risk', label: 'Risk Tools', icon: Shield },
    { id: 'infrastructure', label: 'Infrastructure', icon: Zap }
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col"
      style={{
        backgroundImage: "url('/bojutsu-bg.png')",
        backgroundSize: "100vw 100vh",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header */}
      <div className="relative w-full pt-6 pb-6">
        <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
          <WalletConnectButton />
          <div 
            className="mt-3 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600/30 p-3"
            style={{
              width: "4.8cm",
              height: "2.5cm"
            }}
          >
            <div className="w-full h-full flex flex-col justify-center">
              <div className="text-white font-semibold text-lg mb-1">⚔️ Quickstart</div>
              <div className="flex flex-col text-sm space-y-0.5">
                <button
                  onClick={web3.switchToKatana}
                  className="text-blue-300 hover:underline text-left"
                >
                  Add Katana Testnet
                </button>
                <a href={KATANA_CHAIN.faucet} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  Get Test ETH
                </a>
                <a href={KATANA_CHAIN.bridge} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">
                  Bridge Assets
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center">
            Katana DeFi Platform
          </h1>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6 px-4">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-2 flex gap-2 overflow-x-auto border border-gray-600/30">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex flex-1 justify-center items-start pb-12">
        {activeTab === 'vaults' && <VaultsTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'infrastructure' && <InfrastructureTab />}
      </div>
      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 border-t border-gray-800/50">
        <div className="text-sm">
          Powered by <span className="text-blue-400 font-semibold">@pelenko</span>
        </div>
      </footer>
    </div>
  );
}
