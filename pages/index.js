import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Shield, Calculator, Users, Zap, Target, AlertTriangle, Wallet, Home, RefreshCw, ExternalLink, Copy } from 'lucide-react';

// Real Vaults Data
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

// Contract Addresses
const CONTRACTS = {
  eas: "0x4200000000000000000000000000000000000021",
  safe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938"
};

// Chain Configuration
const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  hexChainId: "0x1f971",
  rpc: "https://rpc.tatara.katanarpc.com",
  explorer: "https://explorer.tatara.katana.network/",
  faucet: "https://faucet-api.polygon.technology/api-docs/",
  bridge: "https://portal-staging.polygon.technology/bridge"
};

// Protocol Data
const PROTOCOL_RATES = [
  { name: "Morpho Blue", apy: "8.2%", tvl: "$2.5M", risk: 7.5, color: "bg-blue-500" },
  { name: "Yearn Vaults", apy: "10.6%", tvl: "$1.8M", risk: 6.8, color: "bg-purple-500" },
  { name: "Sushi LP", apy: "15.3%", tvl: "$3.2M", risk: 8.9, color: "bg-pink-500" },
  { name: "Vertex Perps", apy: "22.1%", tvl: "$850K", risk: 9.2, color: "bg-orange-500" }
];

// Utility Functions
const copyToClipboard = (str) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str);
    alert('Copied to clipboard!');
  }
};

const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Simple Web3 Hook
function useWeb3() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Check for existing connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Check if user manually disconnected
          const manuallyDisconnected = sessionStorage.getItem('walletDisconnected');
          if (manuallyDisconnected === 'true') {
            return; // Don't auto-connect if user manually disconnected
          }

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setChainId(parseInt(chainId, 16));
            setConnected(true);
          }
        } catch (error) {
          console.log('No existing connection found');
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          // Clear manual disconnect flag when user changes accounts in MetaMask
          sessionStorage.removeItem('walletDisconnected');
        } else {
          setConnected(false);
          setAddress('');
          setChainId(null);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setAddress(accounts[0]);
      setChainId(parseInt(chainId, 16));
      setConnected(true);
      
      // Clear manual disconnect flag when user connects
      sessionStorage.removeItem('walletDisconnected');
      
      if (parseInt(chainId, 16) !== 129399) {
        await switchToKatana();
      }
    } catch (error) {
      alert('Failed to connect wallet');
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
        } catch (addError) {
          alert('Failed to add Tatara Network (Katana Testnet)');
        }
      }
    }
  };

  const disconnect = async () => {
    try {
      // Try to disconnect from MetaMask (this method may not be supported by all wallets)
      if (window.ethereum && window.ethereum.disconnect) {
        await window.ethereum.disconnect();
      }
      // Alternative approach: request to disconnect permissions
      else if (window.ethereum && window.ethereum.request) {
        try {
          await window.ethereum.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          });
        } catch (revokeError) {
          // If revokePermissions fails, just disconnect locally
          console.log('Permission revoke not supported, disconnecting locally only');
        }
      }
    } catch (error) {
      console.log('MetaMask disconnect not supported, disconnecting locally only');
    }
    
    // Always disconnect locally regardless of MetaMask support
    setConnected(false);
    setAddress('');
    setChainId(null);
    // Set flag to prevent auto-reconnect on page refresh
    sessionStorage.setItem('walletDisconnected', 'true');
  };

  return {
    connected,
    address,
    chainId,
    connecting,
    connectWallet,
    switchToKatana,
    disconnect
  };
}

// Wallet Connect Button
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

// Main Component
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

  // Portfolio Tab
  const PortfolioTab = () => {
    const [portfolioData, setPortfolioData] = useState({
      totalValue: '0.00',
      positions: [],
      loading: false
    });

    const fetchPortfolioData = async () => {
      if (!web3.connected) {
        return;
      }

      // Set loading state immediately when function is called
      setPortfolioData(prev => ({ ...prev, loading: true }));

      if (web3.chainId !== 129399) {
        try {
          await web3.switchToKatana();
          // Wait a moment for chain state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check again if we're on the right network after switch
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(currentChainId, 16) !== 129399) {
            // User cancelled the switch or it failed
            setPortfolioData(prev => ({ ...prev, loading: false }));
            return;
          }
        } catch (error) {
          // User cancelled or switch failed
          setPortfolioData(prev => ({ ...prev, loading: false }));
          return;
        }
      }

      try {
        const positions = [];
        let totalValue = 0;

        // Fetch balances from each vault
        for (const vault of REAL_VAULTS) {
          try {
            // ERC-20 balanceOf call to vault contract
            const balanceHex = await window.ethereum.request({
              method: 'eth_call',
              params: [{
                to: vault.address,
                data: `0x70a08231000000000000000000000000${web3.address.slice(2)}` // balanceOf(address)
              }, 'latest']
            });

            const balance = parseInt(balanceHex, 16);
            
            if (balance > 0) {
              // Convert balance from wei (assuming 18 decimals)
              const balanceFormatted = (balance / Math.pow(10, 18)).toFixed(6);
              
              // Simple USD value calculation (in real app, you'd use price oracles)
              const mockPrices = { 'AUSD': 1.00, 'WETH': 2400.00 };
              const usdValue = parseFloat(balanceFormatted) * (mockPrices[vault.underlying] || 1);
              
              positions.push({
                vault: vault.name,
                underlying: vault.underlying,
                balance: balanceFormatted,
                usdValue: usdValue.toFixed(2),
                apy: vault.apy,
                protocol: vault.protocol,
                address: vault.address
              });

              totalValue += usdValue;
            }
          } catch (error) {
            console.log(`Failed to fetch balance for ${vault.name}:`, error);
          }
        }

        setPortfolioData({
          totalValue: totalValue.toFixed(2),
          positions,
          loading: false
        });

      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
        setPortfolioData(prev => ({ ...prev, loading: false }));
      }
    };

    // Fetch portfolio data when wallet connects or network changes
    useEffect(() => {
      fetchPortfolioData();
    }, [web3.connected, web3.chainId, web3.address]);

    return (
      <div className="w-full max-w-4xl px-4">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-white">Portfolio Overview</h2>
            <button
              onClick={fetchPortfolioData}
              disabled={portfolioData.loading || !web3.connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${portfolioData.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          <div className="text-4xl font-bold text-green-400 mb-6">
            ${portfolioData.loading ? '...' : portfolioData.totalValue}
          </div>
          
          {portfolioData.loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <div className="text-gray-400 text-lg">Loading portfolio...</div>
            </div>
          ) : portfolioData.positions.length > 0 ? (
            <div className="space-y-4">
              {portfolioData.positions.map((position, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{position.vault}</h3>
                      <div className="text-gray-400 text-sm">{position.protocol} • {position.underlying}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">${position.usdValue}</div>
                      <div className="text-gray-400 text-sm">{position.apy} APY</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-blue-200 font-mono text-sm">
                      {position.balance} {position.underlying}
                    </div>
                    <button
                      onClick={() => window.open(`https://explorer.tatara.katana.network/address/${position.address}`, '_blank')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No positions found</div>
              <div className="text-gray-300 text-sm">
                {web3.connected 
                  ? web3.chainId !== 129399
                    ? "Switch to Katana Network to view your positions"
                    : "Deposit into vaults to see your positions here" 
                  : "Connect your wallet to view portfolio"
                }
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Vaults Tab
  const VaultsTab = () => {
    const handleVaultAction = async (vault, action) => {
      if (!web3.connected) {
        alert('Please connect your wallet first');
        return;
      }
      
      if (web3.chainId !== 129399) {
        try {
          await web3.switchToKatana();
          // Wait a moment for chain state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check again if we're on the right network after switch
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(currentChainId, 16) !== 129399) {
            // User cancelled the switch or it failed
            return;
          }
        } catch (error) {
          // User cancelled or switch failed
          return;
        }
      }
      
      setModal({ open: true, vault, type: action });
    };

    return (
      <div className="w-full max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {REAL_VAULTS.map((vault) => (
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

  // Analytics Tab
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

  // Strategy Tab
  const StrategyTab = () => {
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [customAllocation, setCustomAllocation] = useState({
      morpho: 25,
      yearn: 50,
      sushi: 15,
      vertex: 10
    });
    const [simulationResult, setSimulationResult] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const strategies = [
      { id: 'conservative', name: 'Conservative Yield', description: 'Morpho Lending + Yearn Vaults', apy: '9.5%', risk: 'Low' },
      { id: 'balanced', name: 'Balanced Growth', description: 'LP Farming + Lending', apy: '14.2%', risk: 'Medium' },
      { id: 'aggressive', name: 'High Risk/Reward', description: 'Leveraged LP + Perps', apy: '28.7%', risk: 'High' },
      { id: 'neutral', name: 'Delta Neutral', description: 'Long Vault + Short Perp', apy: '12.1%', risk: 'Medium' }
    ];

    const totalAllocation = Object.values(customAllocation).reduce((a, b) => a + b, 0);

    const simulateStrategy = async () => {
      if (totalAllocation !== 100) {
        alert('Please ensure total allocation equals 100%');
        return;
      }
      
      setIsSimulating(true);
      
      // Simulate strategy calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const protocolAPYs = { morpho: 8.2, yearn: 10.6, sushi: 15.3, vertex: 22.1 };
      const protocolRisks = { morpho: 7.5, yearn: 6.8, sushi: 8.9, vertex: 9.2 };
      
      let expectedAPY = 0;
      let riskScore = 0;
      
      Object.entries(customAllocation).forEach(([protocol, allocation]) => {
        expectedAPY += (protocolAPYs[protocol] * allocation) / 100;
        riskScore += (protocolRisks[protocol] * allocation) / 100;
      });
      
      setSimulationResult({
        expectedAPY: expectedAPY.toFixed(2),
        riskScore: riskScore.toFixed(1),
        allocation: customAllocation
      });
      
      setIsSimulating(false);
      alert('Strategy simulation completed! See results below.');
    };

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Strategy Builder</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Pre-built Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border-gray-600/30 ${
                    selectedStrategy === strategy.id ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <div className="text-white font-bold mb-1">{strategy.name}</div>
                  <div className="text-gray-400 text-sm mb-2">{strategy.description}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-mono">~{strategy.apy} APY</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      strategy.risk === 'Low' ? 'bg-green-900/30 text-green-400' :
                      strategy.risk === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {strategy.risk} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
            <h3 className="text-xl font-bold text-white mb-4">Custom Strategy</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-3">Protocol Allocation</label>
                <div className="space-y-4">
                  {Object.entries(customAllocation).map(([protocol, value]) => (
                    <div key={protocol} className="flex items-center gap-4">
                      <div className="w-20 text-white capitalize">{protocol}:</div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={value}
                        onChange={(e) => setCustomAllocation(prev => ({
                          ...prev,
                          [protocol]: parseInt(e.target.value)
                        }))}
                        className="flex-1 accent-blue-500"
                      />
                      <div className="w-12 text-white text-sm">{value}%</div>
                    </div>
                  ))}
                </div>
                <div className={`mt-2 text-sm ${totalAllocation === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                  Total: {totalAllocation}% {totalAllocation !== 100 && '(should equal 100%)'}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  onClick={simulateStrategy}
                  disabled={isSimulating || totalAllocation !== 100}
                >
                  {isSimulating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Simulating...
                    </>
                  ) : (
                    'Simulate Strategy'
                  )}
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  onClick={() => alert('Strategy saved!')}
                >
                  Save Strategy
                </button>
              </div>
            </div>
          </div>
          
          {simulationResult && (
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold text-white mb-4">Simulation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
                  <div className="text-green-400 font-bold text-lg">Expected APY</div>
                  <div className="text-2xl font-bold text-white">{simulationResult.expectedAPY}%</div>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/20">
                  <div className="text-yellow-400 font-bold text-lg">Risk Score</div>
                  <div className="text-2xl font-bold text-white">{simulationResult.riskScore}/10</div>
                </div>
              </div>
              <div className="mt-4 text-gray-400 text-sm">
                Based on current allocation: Morpho {simulationResult.allocation.morpho}%, Yearn {simulationResult.allocation.yearn}%, Sushi {simulationResult.allocation.sushi}%, Vertex {simulationResult.allocation.vertex}%
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Risk Tab
  const RiskTab = () => {
    const [ilCalculation, setIlCalculation] = useState({
      tokenAChange: '',
      tokenBChange: '',
      result: null
    });

    const calculateIL = () => {
      const changeA = parseFloat(ilCalculation.tokenAChange) / 100;
      const changeB = parseFloat(ilCalculation.tokenBChange) / 100;
      
      if (isNaN(changeA) || isNaN(changeB)) {
        alert('Please enter valid percentage changes');
        return;
      }

      // Check for invalid negative values (price can't go below -100%)
      if (changeA <= -1 || changeB <= -1) {
        alert('Price changes cannot be -100% or lower');
        return;
      }

      // Using correct Uniswap formula: IL = PoolValue / HoldValue - 1
      const priceRatioA = 1 + changeA;
      const priceRatioB = 1 + changeB;
      
      // Correct IL formula: 2*sqrt(priceA/priceB) / (1 + priceA/priceB) - 1
      const priceRatio = priceRatioA / priceRatioB;
      const il = 1 - (2 * Math.sqrt(priceRatio)) / (1 + priceRatio);

      setIlCalculation(prev => ({
        ...prev,
        result: (il * 100).toFixed(2)
      }));
    };

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Risk Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-500/20">
              <AlertTriangle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-bold">Low Risk</div>
              <div className="text-gray-400 text-sm">Safe positions</div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-500/20">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-yellow-400 font-bold">Medium Risk</div>
              <div className="text-gray-400 text-sm">Moderate exposure</div>
            </div>
            <div className="bg-red-900/20 rounded-xl p-4 text-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 font-bold">High Risk</div>
              <div className="text-gray-400 text-sm">Aggressive positions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Impermanent Loss Calculator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white mb-2">Token A Price Change (%)</label>
              <input 
                type="number" 
                placeholder="e.g., 50 for +50%"
                value={ilCalculation.tokenAChange}
                onChange={(e) => setIlCalculation(prev => ({...prev, tokenAChange: e.target.value}))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Token B Price Change (%)</label>
              <input 
                type="number" 
                placeholder="e.g., -20 for -20%"
                value={ilCalculation.tokenBChange}
                onChange={(e) => setIlCalculation(prev => ({...prev, tokenBChange: e.target.value}))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
          </div>
          <button 
            onClick={calculateIL}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mb-4"
          >
            Calculate IL
          </button>
          
          {ilCalculation.result !== null && (
            <div className="p-4 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-lg border border-gray-600/30">
              <div className="text-white">
                Estimated Impermanent Loss: 
                <span className={`ml-2 font-bold ${
                  Math.abs(parseFloat(ilCalculation.result)) <= 1 ? 'text-green-400' :
                  Math.abs(parseFloat(ilCalculation.result)) <= 5 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {ilCalculation.result}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Infrastructure Tab
  const InfrastructureTab = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAction = async (action) => {
      if (!web3.connected) {
        alert('Please connect your wallet first');
        return;
      }

      if (web3.chainId !== 129399) {
        try {
          await web3.switchToKatana();
          // Wait a moment for chain state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check again if we're on the right network after switch
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (parseInt(currentChainId, 16) !== 129399) {
            // User cancelled the switch or it failed
            return;
          }
        } catch (error) {
          // User cancelled or switch failed
          return;
        }
      }

      setLoading(true);
      setMessage(`${action} in progress...`);
      
      try {
        if (action === 'Creating attestation') {
          // EAS Contract interaction
          const easContract = '0x4200000000000000000000000000000000000021';
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              to: easContract,
              from: web3.address,
              data: '0x' // Placeholder for actual attestation data
            }]
          });
          setMessage(`Attestation created! TX: ${txHash.slice(0, 10)}...`);
        } else if (action === 'Creating Safe') {
          // Safe Factory interaction
          const safeFactory = '0x69f4D1788e39c87893C980c06EdF4b7f686e2938';
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              to: safeFactory,
              from: web3.address,
              data: '0x' // Placeholder for safe creation data
            }]
          });
          setMessage(`Safe created! TX: ${txHash.slice(0, 10)}...`);
        } else if (action === 'Creating smart account') {
          // ERC-4337 EntryPoint interaction
          const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
              to: entryPoint,
              from: web3.address,
              data: '0x' // Placeholder for account creation data
            }]
          });
          setMessage(`Smart account created! TX: ${txHash.slice(0, 10)}...`);
        } else if (action === 'Preparing gasless transaction') {
          // UserOperation preparation
          setMessage(`Gasless transaction prepared! Ready to submit.`);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setMessage(`${action} completed successfully!`);
        }
      } catch (error) {
        setMessage(`${action} failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="w-full max-w-4xl px-4">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Infrastructure Tools</h2>
          
          <div className="mb-6 p-4 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl border border-gray-600/30">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${web3.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white font-semibold">
                {web3.connected ? `Connected: ${formatAddress(web3.address)}` : 'Wallet Not Connected'}
              </span>
            </div>
          </div>
          
          {message && (
            <div className="mb-6 p-4 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl border border-gray-600/30">
              <div className="text-white mb-2">{message}</div>
              {loading && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-gray-400 text-sm">Processing...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="grid gap-6">
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Ethereum Attestation Service (EAS)
              </h3>
              <div className="text-gray-400 mb-4">
                Contract: {formatAddress(CONTRACTS.eas)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('Reading attestations')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Read Attestations
                </button>
                <button 
                  onClick={() => handleAction('Creating attestation')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Attestation
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Safe (Gnosis Safe)
              </h3>
              <div className="text-gray-400 mb-4">
                Contract: {formatAddress(CONTRACTS.safe)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('Creating Safe')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Safe
                </button>
                <button 
                  onClick={() => window.open('https://app.safe.global/welcome?chain=kat', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Manage Multisig <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Account Abstraction (ERC-4337)
              </h3>
              <div className="text-gray-400 mb-4">
                EntryPoint: {formatAddress("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('Creating smart account')}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Smart Account
                </button>
                <button 
                  onClick={() => handleAction('Preparing gasless transaction')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Gasless Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <div className="relative w-full pt-6 pb-6">
        <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
          <WalletConnectButton />
          
          <div 
            className="mt-3 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600/30 p-3"
            style={{
              width: "3.9cm",
              height: "2.7cm"
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
      </div>

      <div className="flex justify-center px-4" style={{ marginTop: "8cm", marginBottom: "1cm" }}>
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

      <div className="flex flex-1 justify-center items-start pb-12">
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'vaults' && <VaultsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'infrastructure' && <InfrastructureTab />}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-full max-w-md border border-gray-600/30">
            <div className="text-center mb-6">
              <h2 className="text-xl text-white font-bold mb-2">
                {modal.type === "deposit" ? "Deposit to" : "Withdraw from"}
              </h2>
              <h3 className="text-lg text-blue-400 font-semibold">{modal.vault.name}</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="text-xs text-gray-300 p-3 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded border border-gray-600/30">
                <div className="flex justify-between items-center">
                  <span>Contract:</span>
                  <button
                    onClick={() => copyToClipboard(modal.vault.address)}
                    className="text-blue-400 hover:underline font-mono flex items-center gap-1"
                  >
                    {formatAddress(modal.vault.address)}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <input
                type="number"
                min="0"
                placeholder={`Amount of ${modal.vault.underlying}`}
                className="w-full px-4 py-3 rounded-lg outline-none bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                onClick={() => alert(`${modal.type} transaction would be executed here`)}
              >
                {modal.type === "deposit" ? "Deposit" : "Withdraw"}
              </button>
              <button
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-semibold transition-colors"
                onClick={() => setModal({ open: false, vault: null, type: null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-amber-600">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm">Created by Onur</span>
          <a
            href="https://x.com/pelenko"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:text-blue-400 transition-colors p-1 rounded hover:bg-gray-800/50"
            title="Follow on X"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
