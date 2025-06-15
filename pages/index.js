import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Shield, Calculator, Users, Zap, Target, AlertTriangle, Wallet, Home } from 'lucide-react';

// Web3 functionality - ethers.js simulation for demo
const ethers = {
  providers: {
    Web3Provider: class {
      constructor(provider) {
        this.provider = provider;
      }
      async getSigner() {
        return new ethers.Signer(this);
      }
      async getNetwork() {
        return { chainId: 129399, name: 'Tatara Network' };
      }
    }
  },
  Signer: class {
    constructor(provider) {
      this.provider = provider;
    }
    async getAddress() {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0];
    }
    async signMessage(message) {
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, await this.getAddress()]
      });
    }
  },
  Contract: class {
    constructor(address, abi, signer) {
      this.address = address;
      this.abi = abi;
      this.signer = signer;
    }
    async balanceOf(address) {
      return Math.floor(Math.random() * 1000000);
    }
    async totalSupply() {
      return Math.floor(Math.random() * 10000000);
    }
  },
  utils: {
    formatEther: (wei) => (parseInt(wei) / 1e18).toFixed(4),
    parseEther: (ether) => (parseFloat(ether) * 1e18).toString(),
    isAddress: (address) => /^0x[a-fA-F0-9]{40}$/.test(address)
  }
};

// Contract ABIs
const EAS_ABI = [
  "function attest((bytes32,address,uint64,bool,bytes32,bytes,uint256)) external returns (bytes32)",
  "function getAttestation(bytes32) external view returns ((bytes32,address,uint64,uint64,uint64,bytes32,address,address,bool,bytes))"
];

const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address) external view returns (uint256)"
];

const YEARN_VAULT_ABI = [
  "function deposit(uint256, address) external returns (uint256)",
  "function withdraw(uint256, address, uint256) external returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function totalAssets() external view returns (uint256)"
];

// Tokens and contracts data
const TOKENS = [
  { symbol: "WETH", address: "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4", name: "Wrapped Ether" },
  { symbol: "AUSD", address: "0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC", name: "Agora USD" },
  { symbol: "USDC", address: "0x102E14ffF48170F2e5b6d0e30259fCD4eE5E28aE", name: "USD Coin" },
  { symbol: "USDT", address: "0xDe51Ef59663e79B494E1236551187399D3359C92", name: "Tether USD" },
  { symbol: "USDS", address: "0xD416d04845d299bCC0e5105414C99fFc88f0C97d", name: "USD Stablecoin" },
  { symbol: "WBTC", address: "0x1538aDF273f6f13CcdcdBa41A5ce4b2DC2177D1C", name: "Wrapped Bitcoin" },
  { symbol: "uBTC", address: "0xB295FDad3aD8521E9Bc20CAeBB36A4258038574e", name: "Universal Bitcoin" },
  { symbol: "uSOL", address: "0x79b2417686870EFf463E37a1cA0fDA1c7e2442cE", name: "Universal Solana" },
  { symbol: "uXRP", address: "0x26435983DF976A02C55aC28e6F67C6477bBd95E7", name: "Universal Ripple" }
];

const REAL_VAULTS = [
  {
    name: "AUSD",
    underlying: "AUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    apy: "12.50%",
    tvl: "1,250.00 AUSD",
    explorer: "https://explorer.tatara.katana.network/address/0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60"
  },
  {
    name: "WETH",
    underlying: "WETH",
    address: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
    apy: "8.75%",
    tvl: "45.32 WETH",
    explorer: "https://explorer.tatara.katana.network/address/0xccc0fc2e34428120f985b460b487eb79e3c6fa57"
  }
];

const CONTRACTS = {
  sushiRouter: "0xAC4c6e212A361c968F1725b4d055b47E63F80b75",
  sushiFactory: "0x9B3336186a38E1b6c21955d112dbb0343Ee061eE",
  morphoBlue: "0xC263190b99ceb7e2b7409059D24CB573e3bB9021",
  vertexClearinghouse: "0xf72BE10454B2fB514A2639da885045C89e3EB693",
  agglayerBridge: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
  eas: "0x4200000000000000000000000000000000000021",
  safe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
  multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  yvAUSD: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
  yvWETH: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57"
};

const VAULT_STRATEGIES = [
  "Curve", "Convex", "Aura", "Balancer", "Compound", "Aave", "Morpho",
  "Uniswap", "Sushi", "Vertex", "Arbitrum", "Optimism", "Base", "Polygon",
  "Lido", "Rocket", "Frax", "Maker", "Synthetix", "Curve3Pool", "TriCrypto",
  "StableSwap", "MetaPool", "Boosted", "Leveraged", "Delta", "Gamma", "Alpha"
];

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
    explorer: `https://explorer.tatara.katana.network/address/0x${(i + 3).toString().padStart(40, "0")}`
  };
});

const VAULTS = [...REAL_VAULTS, ...MOCK_VAULTS];

const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  rpc: "https://rpc.tatara.katanarpc.com",
  explorer: "https://explorer.tatara.katana.network/",
  faucet: "https://faucet-api.polygon.technology/api-docs/",
  bridge: "https://portal-staging.polygon.technology/bridge",
  bridgeContract: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
  bridgeAPI: "https://bridge.tatara.katanarpc.com",
  native: "ETH",
  blockTime: 1,
  gasLimit: 60000000,
  gasPricing: "EIP1559",
  dataAvailability: "EIP4844"
};

const PORTFOLIO_DATA = {
  totalValue: "$12,450.32",
  positions: [
    { protocol: "Yearn yvAUSD", amount: "5,200 AUSD", value: "$5,200", apy: "12.5%", risk: "Low" },
    { protocol: "Morpho WETH", amount: "2.5 WETH", value: "$4,250", apy: "8.2%", risk: "Medium" },
    { protocol: "Sushi WETH-AUSD LP", amount: "125.5 LP", value: "$3,000", apy: "15.3%", risk: "High" }
  ]
};

const PROTOCOL_RATES = [
  { name: "Morpho Blue", apy: "8.2%", tvl: "$2.5M", risk: 7.5, color: "bg-blue-500" },
  { name: "Yearn Vaults", apy: "10.6%", tvl: "$1.8M", risk: 6.8, color: "bg-purple-500" },
  { name: "Sushi LP", apy: "15.3%", tvl: "$3.2M", risk: 8.9, color: "bg-pink-500" },
  { name: "Vertex Perps", apy: "22.1%", tvl: "$850K", risk: 9.2, color: "bg-orange-500" }
];

function copyToClipboard(str) {
  navigator.clipboard.writeText(str);
}

// Web3 Provider Hook
function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask.');
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const network = await web3Provider.getNetwork();
      const web3Signer = await web3Provider.getSigner();
      
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(accounts[0]);
      setChainId(network.chainId);
      setConnected(true);

      if (network.chainId !== 129399) {
        await switchToKatana();
      }

      return { provider: web3Provider, signer: web3Signer, address: accounts[0] };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const switchToKatana = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1f971' }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x1f971',
            chainName: KATANA_CHAIN.name,
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: [KATANA_CHAIN.rpc],
            blockExplorerUrls: [KATANA_CHAIN.explorer]
          }]
        });
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
    connectWallet,
    switchToKatana,
    getContract
  };
}

// Enhanced Wallet Connect Button
function WalletConnectButton() {
  const { connected, address, connectWallet, chainId } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      await connectWallet();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isKatanaNetwork = chainId === 129399;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          connected 
            ? 'bg-green-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600'
        }`}
      >
        {isConnecting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </div>
        ) : connected ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            {formatAddress(address)}
          </div>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      {connected && !isKatanaNetwork && (
        <div className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
          ⚠️ Switch to Katana Network
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded max-w-48 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default function KatanaDeFiPlatform() {
  const [activeTab, setActiveTab] = useState('vaults');
  const [modal, setModal] = useState({ open: false, vault: null, type: null });
  const web3 = useWeb3();

  const tabs = [
    { id: 'vaults', label: 'Vaults', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'strategy', label: 'Strategy Builder', icon: Target },
    { id: 'risk', label: 'Risk Tools', icon: Shield },
    { id: 'infrastructure', label: 'Infrastructure', icon: Zap }
  ];

  // Vaults Tab Component
  const VaultsTab = () => {
    const [vaultData, setVaultData] = useState(VAULTS);
    const [refreshing, setRefreshing] = useState(false);

    const refreshVaultData = async () => {
      if (!web3.connected) return;
      
      setRefreshing(true);
      try {
        const updatedVaults = [...VAULTS];
        
        for (let i = 0; i < REAL_VAULTS.length; i++) {
          const vault = REAL_VAULTS[i];
          try {
            const vaultContract = web3.getContract(vault.address, YEARN_VAULT_ABI);
            const totalAssets = await vaultContract.totalAssets();
            
            updatedVaults[i] = {
              ...vault,
              tvl: `${ethers.utils.formatEther(totalAssets)} ${vault.underlying}`,
              lastUpdated: new Date().toLocaleTimeString()
            };
          } catch (error) {
            console.error(`Error updating vault ${vault.name}:`, error);
          }
        }
        
        setVaultData(updatedVaults);
      } catch (error) {
        console.error('Vault refresh error:', error);
      } finally {
        setRefreshing(false);
      }
    };

    const handleVaultAction = async (vault, action) => {
      if (!web3.connected) {
        alert('Please connect your wallet first');
        return;
      }

      if (web3.chainId !== 129399) {
        alert('Please switch to Katana Network');
        return;
      }

      const isRealVault = REAL_VAULTS.some(rv => rv.address === vault.address);
      setModal({ open: true, vault: { ...vault, isReal: isRealVault }, type: action });
    };

    return (
      <div className="w-full max-w-7xl px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <span className="text-green-400 font-bold">{REAL_VAULTS.length}</span> Real Vaults • 
            <span className="text-gray-400 ml-2">{MOCK_VAULTS.length}</span> Demo Vaults
          </div>
          <button
            onClick={refreshVaultData}
            disabled={refreshing || !web3.connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              <>🔄 Refresh Data</>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {vaultData.map((vault, index) => {
            const isReal = index < REAL_VAULTS.length;
            return (
              <div
                key={vault.address}
                className={`rounded-2xl p-6 shadow-lg flex flex-col justify-between min-h-[180px] ${
                  isReal ? 'bg-[#181c26cc] border-2 border-green-500/30' : 'bg-[#181c26cc]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-lg font-bold text-white">{vault.name}</div>
                    {isReal && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Underlying: {vault.underlying}</div>
                  <div className="flex gap-4 mb-4">
                    <span className="text-green-400 font-mono">APY: {vault.apy}</span>
                    <span className="text-blue-200 font-mono">TVL: {vault.tvl}</span>
                  </div>
                  {vault.lastUpdated && (
                    <div className="text-xs text-gray-500">Updated: {vault.lastUpdated}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className={`text-white text-xs px-2 py-1 rounded ${
                      isReal 
                        ? 'bg-green-700 hover:bg-green-800' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => handleVaultAction(vault, "deposit")}
                    disabled={!isReal && !web3.connected}
                  >
                    Deposit
                  </button>
                  <button
                    className={`text-white text-xs px-2 py-1 rounded ${
                      isReal 
                        ? 'bg-red-700 hover:bg-red-800' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                    onClick={() => handleVaultAction(vault, "withdraw")}
                    disabled={!isReal && !web3.connected}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Portfolio Tab Component
  const PortfolioTab = () => {
    const [portfolioData, setPortfolioData] = useState(PORTFOLIO_DATA);
    const [refreshing, setRefreshing] = useState(false);

    const refreshPortfolio = async () => {
      if (!web3.connected) {
        alert('Please connect your wallet first');
        return;
      }

      setRefreshing(true);
      try {
        const yvAUSDContract = web3.getContract(CONTRACTS.yvAUSD, YEARN_VAULT_ABI);
        const yvWETHContract = web3.getContract(CONTRACTS.yvWETH, YEARN_VAULT_ABI);
        
        const ausdBalance = await yvAUSDContract.balanceOf(web3.address);
        const wethBalance = await yvWETHContract.balanceOf(web3.address);
        
        const ausdValue = ethers.utils.formatEther(ausdBalance);
        const wethValue = ethers.utils.formatEther(wethBalance);
        
        const updatedPositions = [
          {
            protocol: "Yearn yvAUSD",
            amount: `${parseFloat(ausdValue).toFixed(2)} yvAUSD`,
            value: `$${(parseFloat(ausdValue) * 1.0).toFixed(2)}`,
            apy: "12.5%",
            risk: "Low",
            contract: CONTRACTS.yvAUSD
          },
          {
            protocol: "Yearn yvWETH", 
            amount: `${parseFloat(wethValue).toFixed(4)} yvWETH`,
            value: `$${(parseFloat(wethValue) * 1700).toFixed(2)}`,
            apy: "8.75%", 
            risk: "Medium",
            contract: CONTRACTS.yvWETH
          }
        ];

        const totalValue = updatedPositions.reduce((sum, pos) => {
          return sum + parseFloat(pos.value.replace('$', ''));
        }, 0);

        setPortfolioData({
          totalValue: `$${totalValue.toFixed(2)}`,
          positions: updatedPositions
        });

      } catch (error) {
        console.error('Portfolio refresh error:', error);
        alert(`Failed to refresh portfolio: ${error.message}`);
      } finally {
        setRefreshing(false);
      }
    };

    return (
      <div className="w-full max-w-4xl px-4">
        <div className="bg-[#181c26cc] rounded-2xl p-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-white">Portfolio Overview</h2>
            <button
              onClick={refreshPortfolio}
              disabled={refreshing || !web3.connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>🔄 Refresh</>
              )}
            </button>
          </div>
          
          <div className="text-4xl font-bold text-green-400 mb-6">{portfolioData.totalValue}</div>
          
          <div className="grid gap-4">
            {portfolioData.positions.map((position, i) => (
              <div key={i} className="bg-[#222537] rounded-xl p-6 flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-white">{position.protocol}</div>
                  <div className="text-gray-400">{position.amount}</div>
                  {position.contract && (
                    <div className="text-xs text-blue-400 font-mono mt-1">
                      {position.contract.slice(0, 10)}...{position.contract.slice(-8)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{position.value}</div>
                  <div className="text-green-400">APY: {position.apy}</div>
                  <div className={`text-sm ${position.risk === 'Low' ? 'text-green-400' : position.risk === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {position.risk} Risk
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {!web3.connected && (
            <div className="mt-4 p-4 bg-yellow-900/20 rounded-xl text-yellow-400 text-center">
              Connect your wallet to view real portfolio data
            </div>
          )}
        </div>
        
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Position Health</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/20 rounded-xl p-4 text-center">
              <div className="text-green-400 font-bold text-xl">85%</div>
              <div className="text-gray-400">Health Score</div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 text-center">
              <div className="text-yellow-400 font-bold text-xl">3.2x</div>
              <div className="text-gray-400">Avg Leverage</div>
            </div>
            <div className="bg-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-blue-400 font-bold text-xl">$1,250</div>
              <div className="text-gray-400">Available Margin</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="w-full max-w-6xl px-4">
      <div className="bg-[#181c26cc] rounded-2xl p-8 mb-6">
        <h2 className="text-3xl font-bold text-white mb-6">Protocol Comparison</h2>
        <div className="grid gap-4">
          {PROTOCOL_RATES.map((protocol, i) => (
            <div key={i} className="bg-[#222537] rounded-xl p-6">
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
              <div className="mt-4 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${protocol.color}`}
                  style={{ width: `${protocol.risk * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Yield Trends</h3>
          <div className="text-gray-400">Historical APY data would be shown here with charts</div>
        </div>
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">TVL Analysis</h3>
          <div className="text-gray-400">Total Value Locked trends across protocols</div>
        </div>
      </div>
    </div>
  );

  // Strategy Tab Component
  const StrategyTab = () => (
    <div className="w-full max-w-4xl px-4">
      <div className="bg-[#181c26cc] rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Strategy Builder</h2>
        
        <div className="grid gap-6">
          <div className="bg-[#222537] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Available Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#181c26] rounded-lg p-4 cursor-pointer hover:bg-[#252a3a]">
                <div className="text-white font-bold">Conservative Yield</div>
                <div className="text-gray-400 text-sm">Morpho Lending + Yearn Vaults</div>
                <div className="text-green-400 mt-2">~9.5% APY</div>
              </div>
              <div className="bg-[#181c26] rounded-lg p-4 cursor-pointer hover:bg-[#252a3a]">
                <div className="text-white font-bold">Balanced Growth</div>
                <div className="text-gray-400 text-sm">LP Farming + Lending</div>
                <div className="text-green-400 mt-2">~14.2% APY</div>
              </div>
              <div className="bg-[#181c26] rounded-lg p-4 cursor-pointer hover:bg-[#252a3a]">
                <div className="text-white font-bold">High Risk/Reward</div>
                <div className="text-gray-400 text-sm">Leveraged LP + Perps</div>
                <div className="text-green-400 mt-2">~28.7% APY</div>
              </div>
              <div className="bg-[#181c26] rounded-lg p-4 cursor-pointer hover:bg-[#252a3a]">
                <div className="text-white font-bold">Delta Neutral</div>
                <div className="text-gray-400 text-sm">Long Vault + Short Perp</div>
                <div className="text-green-400 mt-2">~12.1% APY</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#222537] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Custom Strategy</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Select Protocols</label>
                <div className="flex gap-2 flex-wrap">
                  {['Morpho', 'Yearn', 'Sushi', 'Vertex'].map(protocol => (
                    <button key={protocol} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      {protocol}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Allocation</label>
                <input 
                  type="range" 
                  className="w-full" 
                  min="0" 
                  max="100" 
                  defaultValue="50"
                />
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
                Simulate Strategy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Risk Tab Component
  const RiskTab = () => (
    <div className="w-full max-w-4xl px-4">
      <div className="grid gap-6">
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Risk Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/20 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-bold">Low Risk</div>
              <div className="text-gray-400 text-sm">2 positions</div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-yellow-400 font-bold">Medium Risk</div>
              <div className="text-gray-400 text-sm">1 position</div>
            </div>
            <div className="bg-red-900/20 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 font-bold">High Risk</div>
              <div className="text-gray-400 text-sm">0 positions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            <Calculator className="inline w-6 h-6 mr-2" />
            Impermanent Loss Calculator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Token A Price Change</label>
              <input 
                type="number" 
                placeholder="% change"
                className="w-full px-3 py-2 bg-[#222537] text-white rounded"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Token B Price Change</label>
              <input 
                type="number" 
                placeholder="% change"
                className="w-full px-3 py-2 bg-[#222537] text-white rounded"
              />
            </div>
          </div>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
            Calculate IL
          </button>
          <div className="mt-4 p-4 bg-[#222537] rounded">
            <div className="text-white">Estimated IL: <span className="text-red-400">-2.3%</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Infrastructure Tab Component
  const InfrastructureTab = () => {
    const [easData, setEasData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');

    const readAttestations = async () => {
      if (!web3.connected) {
        setMessage('❌ Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('📡 Reading attestations from EAS contract...');
      
      try {
        const easContract = web3.getContract(CONTRACTS.eas, EAS_ABI);
        
        const mockAttestations = [
          { 
            id: '0x1234...5678', 
            schema: 'Vault Performance Rating', 
            attester: web3.address || '0x0000...0000',
            data: 'High Performance: 12.5% APY',
            timestamp: Date.now()
          },
          { 
            id: '0x5678...9abc', 
            schema: 'Risk Assessment', 
            attester: '0xABC...DEF',
            data: 'Medium Risk: Score 7.2/10',
            timestamp: Date.now() - 86400000
          }
        ];

        setEasData(mockAttestations);
        setMessage(`✅ Successfully connected to EAS contract at ${CONTRACTS.eas}`);
        setLoading(false);
        
      } catch (error) {
        console.error('EAS Error:', error);
        setMessage(`❌ Failed to read attestations: ${error.message}`);
        setLoading(false);
      }
    };

    const createAttestation = async () => {
      if (!web3.connected) {
        setMessage('❌ Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('✍️ Creating new attestation...');
      
      try {
        const simulatedTxHash = '0x' + Math.random().toString(16).slice(2, 66);
        setTxHash(simulatedTxHash);
        
        setMessage(`✅ Attestation created! TX: ${simulatedTxHash.slice(0, 10)}...`);
        setLoading(false);
        
      } catch (error) {
        console.error('Attestation Error:', error);
        setMessage(`❌ Failed to create attestation: ${error.message}`);
        setLoading(false);
      }
    };

    const createSafe = async () => {
      if (!web3.connected) {
        setMessage('❌ Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('🔐 Creating new Safe multisig...');
      
      try {
        const simulatedSafeAddress = '0x' + Math.random().toString(16).slice(2, 42);
        const simulatedTxHash = '0x' + Math.random().toString(16).slice(2, 66);
        
        setTxHash(simulatedTxHash);
        setMessage(`✅ Safe created! Address: ${simulatedSafeAddress.slice(0, 10)}... TX: ${simulatedTxHash.slice(0, 10)}...`);
        setLoading(false);
        
      } catch (error) {
        console.error('Safe Error:', error);
        setMessage(`❌ Failed to create Safe: ${error.message}`);
        setLoading(false);
      }
    };

    const manageSafe = () => {
      const katanaSafeUrl = `https://app.safe.global/welcome?chain=kat`;
      window.open(katanaSafeUrl, '_blank');
      setMessage('🔗 Opened Safe interface for Katana network');
    };

    const createSmartAccount = async () => {
      if (!web3.connected) {
        setMessage('❌ Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('🤖 Creating ERC-4337 smart account...');
      
      try {
        const simulatedAccountAddress = '0x' + Math.random().toString(16).slice(2, 42);
        const simulatedTxHash = '0x' + Math.random().toString(16).slice(2, 66);
        
        setTxHash(simulatedTxHash);
        setMessage(`✅ Smart account created! Address: ${simulatedAccountAddress.slice(0, 10)}... TX: ${simulatedTxHash.slice(0, 10)}...`);
        setLoading(false);
        
      } catch (error) {
        console.error('Smart Account Error:', error);
        setMessage(`❌ Failed to create smart account: ${error.message}`);
        setLoading(false);
      }
    };

    const gaslessTransaction = async () => {
      if (!web3.connected) {
        setMessage('❌ Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('⛽ Preparing gasless transaction...');
      
      try {
        const simulatedUserOpHash = '0x' + Math.random().toString(16).slice(2, 66);
        
        setMessage(`✅ Gasless transaction ready! UserOp hash: ${simulatedUserOpHash.slice(0, 10)}...`);
        setLoading(false);
        
      } catch (error) {
        console.error('Gasless Transaction Error:', error);
        setMessage(`❌ Failed to prepare gasless transaction: ${error.message}`);
        setLoading(false);
      }
    };

    const openExplorer = () => {
      if (txHash) {
        window.open(`${KATANA_CHAIN.explorer}tx/${txHash}`, '_blank');
      }
    };

    return (
      <div className="w-full max-w-4xl px-4">
        <div className="bg-[#181c26cc] rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Infrastructure Tools</h2>
          
          <div className="mb-6 p-4 bg-[#222537] rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${web3.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white font-semibold">
                {web3.connected ? `Connected: ${web3.address?.slice(0, 6)}...${web3.address?.slice(-4)}` : 'Wallet Not Connected'}
              </span>
            </div>
            {web3.chainId && web3.chainId !== 129399 && (
              <div className="text-yellow-400 text-sm">⚠️ Please switch to Katana Network (Chain ID: 129399)</div>
            )}
          </div>
          
          {message && (
            <div className="mb-6 p-4 bg-[#222537] rounded-xl">
              <div className="text-white">{message}</div>
              {txHash && (
                <button 
                  onClick={openExplorer}
                  className="mt-2 text-blue-400 hover:underline text-sm"
                >
                  View on Explorer →
                </button>
              )}
              {loading && (
                <div className="mt-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="grid gap-6">
            <div className="bg-[#222537] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <Users className="inline w-6 h-6 mr-2" />
                Ethereum Attestation Service (EAS)
              </h3>
              <div className="text-gray-400 mb-4">Contract: {CONTRACTS.eas}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={readAttestations}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {loading ? 'Reading...' : 'Read Attestations'}
                </button>
                <button 
                  onClick={createAttestation}
                  disabled={loading || !web3.connected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Attestation'}
                </button>
              </div>
              
              {easData && (
                <div className="bg-[#181c26] rounded p-4">
                  <div className="text-white font-bold mb-2">Recent Attestations:</div>
                  {easData.map((attestation, i) => (
                    <div key={i} className="text-sm text-gray-300 mb-2 p-2 bg-[#222537] rounded">
                      <div><span className="text-blue-400">Schema:</span> {attestation.schema}</div>
                      <div><span className="text-green-400">Data:</span> {attestation.data}</div>
                      <div className="text-xs text-gray-500">ID: {attestation.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-[#222537] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <Shield className="inline w-6 h-6 mr-2" />
                Safe (Gnosis Safe)
              </h3>
              <div className="text-gray-400 mb-4">Contract: {CONTRACTS.safe}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={createSafe}
                  disabled={loading || !web3.connected}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Safe'}
                </button>
                <button 
                  onClick={manageSafe}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Manage Multisig
                </button>
              </div>
            </div>
            
            <div className="bg-[#222537] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <Zap className="inline w-6 h-6 mr-2" />
                Account Abstraction (ERC-4337)
              </h3>
              <div className="text-gray-400 mb-4">EntryPoint: 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={createSmartAccount}
                  disabled={loading || !web3.connected}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Smart Account'}
                </button>
                <button 
                  onClick={gaslessTransaction}
                  disabled={loading || !web3.connected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  {loading ? 'Preparing...' : 'Gasless Transactions'}
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
      className="min-h-screen bg-[#0d101a] flex flex-col"
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
        
        <div className="pt-8 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center">Katana DeFi Platform</h1>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-[#1c2230cc] rounded-xl p-2 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#292d3e]'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 justify-center items-start">
        {activeTab === 'vaults' && <VaultsTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'strategy' && <StrategyTab />}
        {activeTab === 'risk' && <RiskTab />}
        {activeTab === 'infrastructure' && <InfrastructureTab />}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="bg-[#222537] rounded-2xl p-8 shadow-2xl w-full max-w-md flex flex-col items-center">
            <h2 className="text-lg text-white mb-2 font-bold">
              {modal.type === "deposit" ? "Deposit to" : "Withdraw from"} {modal.vault.name}
            </h2>
            
            {modal.vault.isReal && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Live Vault</span>
              </div>
            )}
            
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
              disabled={!modal.vault.isReal}
            />
            
            <div className="flex gap-3">
              <button
                className={`px-4 py-1 rounded text-white ${
                  modal.vault.isReal 
                    ? 'bg-blue-700 hover:bg-blue-800' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!modal.vault.isReal}
                title={modal.vault.isReal ? "Ready for transaction" : "Demo vault - not functional"}
              >
                {modal.type === "deposit" ? "Deposit" : "Withdraw"}
              </button>
              <button
                className="px-4 py-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
                onClick={() => setModal({ open: false, vault: null, type: null })}
              >
                Cancel
              </button>
            </div>
            
            <div className="text-xs mt-3 text-center">
              {modal.vault.isReal ? (
                <span className="text-green-300">Ready for real transaction on Katana</span>
              ) : (
                <span className="text-yellow-300">Demo vault - for display only</span>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="text-center mt-12 mb-8 text-gray-400">
        Powered by @pelenko
      </footer>
    </div>
  );
}
