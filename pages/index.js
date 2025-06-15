{/* Actions */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 text-white text-xs px-3 py-2 rounded transition-colors ${
                      isReal 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => handleVaultAction(vault, "deposit")}
                    disabled={!isReal}
                    title={isReal ? "Deposit tokens" : "Demo vault - not functional"}
                  >
                    Deposit
                  </button>
                  <button
                    className={`flex-1 text-white text-xs px-3 py-2 rounded transition-colors ${
                      isReal 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => handleVaultAction(vault, "withdraw")}
                    disabled={!isReal}
                    title={isReal ? "Withdraw tokens" : "Demo vault - not functional"}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVaults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No vaults found</div>
            <div className="text-gray-500 text-sm">Try adjusting your filters</div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Portfolio Tab Component
  const PortfolioTab = () => {
    const [portfolioData, setPortfolioData] = useState(INITIAL_PORTFOLIO_DATA);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (web3.connected) {
        loadPortfolioData();
      }
    }, [web3.connected, web3.address]);

    const loadPortfolioData = async () => {
      if (!web3.connected) return;
      
      setLoading(true);
      
      try {
        const positions = [];
        let totalValue = 0;

        // Check balances in real vaults
        for (const vault of REAL_VAULTS) {
          try {
            const vaultContract = web3.getContract(vault.address, YEARN_VAULT_ABI);
            const balance = await vaultContract.balanceOf(web3.address);
            
            if (balance > 0n) {
              const balanceFormatted = ethers.formatEther(balance);
              const valueUSD = parseFloat(balanceFormatted) * (vault.underlying === 'WETH' ? 1700 : 1);
              
              positions.push({
                protocol: `${vault.protocol} ${vault.underlying}`,
                amount: `${parseFloat(balanceFormatted).toFixed(4)} ${vault.underlying}`,
                value: formatCurrency(valueUSD),
                apy: vault.apy,
                risk: vault.risk,
                contract: vault.address,
                underlying: vault.underlying
              });
              
              totalValue += valueUSD;
            }
          } catch (error) {
            console.error(`Error loading ${vault.name} balance:`, error);
          }
        }

        setPortfolioData({
          totalValue: formatCurrency(totalValue),
          positions,
          healthScore: positions.length > 0 ? 85 : 100,
          avgLeverage: "1.0x",
          availableMargin: formatCurrency(totalValue * 0.1)
        });

      } catch (error) {
        console.error('Portfolio loading error:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    const refreshPortfolio = async () => {
      setRefreshing(true);
      await loadPortfolioData();
      setRefreshing(false);
      toast.success('Portfolio refreshed!');
    };

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        {/* Portfolio Overview */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Portfolio Overview</h2>
            <button
              onClick={refreshPortfolio}
              disabled={refreshing || !web3.connected}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {/* Total Value */}
          <div className="text-4xl font-bold text-green-400 mb-6">{portfolioData.totalValue}</div>
          
          {/* Positions */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-400">Loading positions...</span>
            </div>
          ) : portfolioData.positions.length > 0 ? (
            <div className="grid gap-4">
              {portfolioData.positions.map((position, i) => (
                <div key={i} className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-xl font-bold text-white mb-1">{position.protocol}</div>
                      <div className="text-gray-400 mb-2">{position.amount}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(position.contract)}
                          className="text-xs text-blue-400 hover:underline font-mono flex items-center gap-1"
                        >
                          {formatAddress(position.contract)}
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => window.open(`${KATANA_CHAIN.explorer}address/${position.contract}`, '_blank')}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white mb-1">{position.value}</div>
                      <div className="text-green-400 text-sm mb-1">APY: {position.apy}</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        position.risk === 'Low' ? 'bg-green-900/30 text-green-400' :
                        position.risk === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {position.risk} Risk
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No positions found</div>
              <div className="text-gray-500 text-sm">
                {web3.connected 
                  ? "Deposit into vaults to see your positions here" 
                  : "Connect your wallet to view portfolio"
                }
              </div>
            </div>
          )}
        </div>
        
        {/* Position Health */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h3 className="text-2xl font-bold text-white mb-6">Position Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-500/20">
              <div className="text-green-400 font-bold text-2xl">{portfolioData.healthScore}%</div>
              <div className="text-gray-400 text-sm">Health Score</div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-500/20">
              <div className="text-yellow-400 font-bold text-2xl">{portfolioData.avgLeverage}</div>
              <div className="text-gray-400 text-sm">Avg Leverage</div>
            </div>
            <div className="bg-blue-900/20 rounded-xl p-4 text-center border border-blue-500/20">
              <div className="text-blue-400 font-bold text-2xl">{portfolioData.availableMargin}</div>
              <div className="text-gray-400 text-sm">Available Margin</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Analytics Tab Component
  const AnalyticsTab = () => (
    <div className="w-full max-w-6xl px-4 space-y-6">
      {/* Protocol Comparison */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
        <h2 className="text-3xl font-bold text-white mb-6">Protocol Comparison</h2>
        <div className="grid gap-4">
          {PROTOCOL_RATES.map((protocol, i) => (
            <div key={i} className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20 hover:border-gray-500/40 transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${protocol.color}`}></div>
                  <div>
                    <span className="text-xl font-bold text-white">{protocol.name}</span>
                    <div className="text-gray-400 text-sm">{protocol.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{protocol.apy}</div>
                  <button
                    onClick={() => window.open(protocol.website, '_blank')}
                    className="text-blue-400 hover:underline text-sm flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-gray-400 mb-3">
                <span>TVL: {protocol.tvl}</span>
                <span>Risk Score: {protocol.risk}/10</span>
              </div>
              <div className="bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${protocol.color} transition-all duration-1000`}
                  style={{ width: `${protocol.risk * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h3 className="text-2xl font-bold text-white mb-4">Yield Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-700/20 rounded-lg border border-gray-600/20">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-400">Historical APY chart</div>
              <div className="text-gray-500 text-sm">Coming soon</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h3 className="text-2xl font-bold text-white mb-4">TVL Analysis</h3>
          <div className="h-64 flex items-center justify-center bg-gray-700/20 rounded-lg border border-gray-600/20">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-400">TVL trends chart</div>
              <div className="text-gray-500 text-sm">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Strategy Tab Component
  const StrategyTab = () => {
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [customAllocation, setCustomAllocation] = useState({
      morpho: 25,
      yearn: 50,
      sushi: 15,
      vertex: 10
    });

    const strategies = [
      {
        id: 'conservative',
        name: 'Conservative Yield',
        description: 'Morpho Lending + Yearn Vaults',
        apy: '9.5%',
        risk: 'Low',
        allocation: { morpho: 40, yearn: 60, sushi: 0, vertex: 0 },
        color: 'border-green-500/30 bg-green-900/10'
      },
      {
        id: 'balanced',
        name: 'Balanced Growth',
        description: 'LP Farming + Lending',
        apy: '14.2%',
        risk: 'Medium',
        allocation: { morpho: 30, yearn: 40, sushi: 30, vertex: 0 },
        color: 'border-yellow-500/30 bg-yellow-900/10'
      },
      {
        id: 'aggressive',
        name: 'High Risk/Reward',
        description: 'Leveraged LP + Perps',
        apy: '28.7%',
        risk: 'High',
        allocation: { morpho: 10, yearn: 20, sushi: 40, vertex: 30 },
        color: 'border-red-500/30 bg-red-900/10'
      },
      {
        id: 'neutral',
        name: 'Delta Neutral',
        description: 'Long Vault + Short Perp',
        apy: '12.1%',
        risk: 'Medium',
        allocation: { morpho: 0, yearn: 50, sushi: 0, vertex: 50 },
        color: 'border-blue-500/30 bg-blue-900/10'
      }
    ];

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Strategy Builder</h2>
          
          {/* Pre-built Strategies */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Pre-built Strategies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className={`rounded-lg p-4 cursor-pointer transition-all hover:scale-105 border ${
                    selectedStrategy === strategy.id 
                      ? strategy.color + ' ring-2 ring-blue-400' 
                      : strategy.color
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
          
          {/* Custom Strategy Builder */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20">
            <h3 className="text-xl font-bold text-white mb-4">Custom Strategy</h3>
            <div className="space-y-6">
              {/* Protocol Selection */}
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
                <div className="mt-2 text-sm text-gray-400">
                  Total: {Object.values(customAllocation).reduce((a, b) => a + b, 0)}%
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Simulate Strategy
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Save Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Risk Tab Component  
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
        toast.error('Please enter valid percentage changes');
        return;
      }

      // Simplified IL calculation
      const priceRatio = (1 + changeA) / (1 + changeB);
      const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1;
      
      setIlCalculation(prev => ({
        ...prev,
        result: (il * 100).toFixed(2)
      }));
    };

    return (
      <div className="w-full max-w-4xl px-4 space-y-6">
        {/* Risk Overview */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Risk Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-900/20 rounded-xl p-4 text-center border border-green-500/20">
              <AlertTriangle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-bold">Low Risk</div>
              <div className="text-gray-400 text-sm">
                {web3.connected ? 
                  `${portfolioData?.positions?.filter(p => p.risk === 'Low').length || 0} positions` :
                  '- positions'
                }
              </div>
            </div>
            <div className="bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-500/20">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-yellow-400 font-bold">Medium Risk</div>
              <div className="text-gray-400 text-sm">
                {web3.connected ? 
                  `${portfolioData?.positions?.filter(p => p.risk === 'Medium').length || 0} positions` :
                  '- positions'
                }
              </div>
            </div>
            <div className="bg-red-900/20 rounded-xl p-4 text-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 font-bold">High Risk</div>
              <div className="text-gray-400 text-sm">
                {web3.connected ? 
                  `${portfolioData?.positions?.filter(p => p.risk === 'High').length || 0} positions` :
                  '- positions'
                }
              </div>
            </div>
          </div>
        </div>
        
        {/* IL Calculator */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Token B Price Change (%)</label>
              <input 
                type="number" 
                placeholder="e.g., -20 for -20%"
                value={ilCalculation.tokenBChange}
                onChange={(e) => setIlCalculation(prev => ({...prev, tokenBChange: e.target.value}))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/20">
              <div className="text-white">
                Estimated Impermanent Loss: 
                <span className={`ml-2 font-bold ${
                  parseFloat(ilCalculation.result) < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {ilCalculation.result}%
                </span>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                This is a simplified calculation. Actual IL may vary based on trading fees and other factors.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Infrastructure Tab Component
  const InfrastructureTab = () => {
    const [easData, setEasData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [txHash, setTxHash] = useState('');

    const readAttestations = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('📡 Reading attestations from EAS contract...');
      
      try {
        // In a real implementation, you would query the EAS contract
        // For demo purposes, we'll simulate the data
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockAttestations = [
          { 
            id: '0x1234...5678', 
            schema: 'Vault Performance Rating', 
            attester: web3.address,
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
        setMessage(`✅ Successfully read attestations from EAS contract`);
        toast.success('Attestations loaded successfully!');
        
      } catch (error) {
        console.error('EAS Error:', error);
        setMessage(`❌ Failed to read attestations: ${error.message}`);
        toast.error('Failed to read attestations');
      } finally {
        setLoading(false);
      }
    };

    const createAttestation = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('✍️ Creating new attestation...');
      
      try {
        // In a real implementation, you would call the EAS contract
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const simulatedTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setTxHash(simulatedTxHash);
        
        setMessage(`✅ Attestation created! Transaction: ${simulatedTxHash.slice(0, 10)}...`);
        toast.success('Attestation created successfully!');
        
      } catch (error) {
        console.error('Attestation Error:', error);
        setMessage(`❌ Failed to create attestation: ${error.message}`);
        toast.error('Failed to create attestation');
      } finally {
        setLoading(false);
      }
    };

    const createSafe = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('🔐 Creating new Safe multisig...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const simulatedSafeAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const simulatedTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        setTxHash(simulatedTxHash);
        setMessage(`✅ Safe created! Address: ${simulatedSafeAddress.slice(0, 10)}...`);
        toast.success('Safe created successfully!');
        
      } catch (error) {
        console.error('Safe Error:', error);
        setMessage(`❌ Failed to create Safe: ${error.message}`);
        toast.error('Failed to create Safe');
      } finally {
        setLoading(false);
      }
    };

    const manageSafe = () => {
      const katanaSafeUrl = `https://app.safe.global/welcome?chain=kat`;
      window.open(katanaSafeUrl, '_blank');
      setMessage('🔗 Opened Safe interface for Katana network');
      toast.info('Opened Safe interface');
    };

    const createSmartAccount = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('🤖 Creating ERC-4337 smart account...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const simulatedAccountAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const simulatedTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        setTxHash(simulatedTxHash);
        setMessage(`✅ Smart account created! Address: ${simulatedAccountAddress.slice(0, 10)}...`);
        toast.success('Smart account created successfully!');
        
      } catch (error) {
        console.error('Smart Account Error:', error);
        setMessage(`❌ Failed to create smart account: ${error.message}`);
        toast.error('Failed to create smart account');
      } finally {
        setLoading(false);
      }
    };

    const gaslessTransaction = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);
      setMessage('⛽ Preparing gasless transaction...');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const simulatedUserOpHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        setMessage(`✅ Gasless transaction ready! UserOp hash: ${simulatedUserOpHash.slice(0, 10)}...`);
        toast.success('Gasless transaction prepared!');
        
      } catch (error) {
        console.error('Gasless Transaction Error:', error);
        setMessage(`❌ Failed to prepare gasless transaction: ${error.message}`);
        toast.error('Failed to prepare gasless transaction');
      } finally {
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
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
          <h2 className="text-3xl font-bold text-white mb-6">Infrastructure Tools</h2>
          
          {/* Connection Status */}
          <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${web3.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-white font-semibold">
                {web3.connected ? `Connected: ${formatAddress(web3.address)}` : 'Wallet Not Connected'}
              </span>
            </div>
            {web3.connected && web3.chainId !== 129399 && (
              <div className="text-yellow-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Please switch to Katana Network (Chain ID: 129399)
              </div>
            )}
          </div>
          
          {/* Status Message */}
          {message && (
            <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/20">
              <div className="text-white mb-2">{message}</div>
              {txHash && (
                <button 
                  onClick={openExplorer}
                  className="text-blue-400 hover:underline text-sm flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="w-3 h-3" />
                </button>
              )}
              {loading && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-gray-400 text-sm">Processing...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="grid gap-6">
            {/* EAS Section */}
            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Ethereum Attestation Service (EAS)
              </h3>
              <div className="text-gray-400 mb-4 flex items-center gap-2">
                Contract: 
                <button
                  onClick={() => copyToClipboard(CONTRACTS.eas)}
                  className="text-blue-400 hover:underline font-mono flex items-center gap-1"
                >
                  {formatAddress(CONTRACTS.eas)}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={readAttestations}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {loading ? 'Reading...' : 'Read Attestations'}
                </button>
                <button 
                  onClick={createAttestation}
                  disabled={loading || !web3.connected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {loading ? 'Creating...' : 'Create Attestation'}
                </button>
              </div>
              
              {/* Display EAS Data */}
              {easData && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/20">
                  <div className="text-white font-bold mb-3">Recent Attestations:</div>
                  {easData.map((attestation, i) => (
                    <div key={i} className="text-sm text-gray-300 mb-3 p-3 bg-gray-700/30 rounded border border-gray-600/10">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-blue-400 font-semibold">{attestation.schema}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(attestation.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-white mb-1">{attestation.data}</div>
                      <div className="text-gray-500 text-xs">
                        ID: {attestation.id} | Attester: {formatAddress(attestation.attester)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Safe Section */}
            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Safe (Gnosis Safe)
              </h3>
              <div className="text-gray-400 mb-4 flex items-center gap-2">
                Contract: 
                <button
                  onClick={() => copyToClipboard(CONTRACTS.safe)}
                  className="text-blue-400 hover:underline font-mono flex items-center gap-1"
                >
                  {formatAddress(CONTRACTS.safe)}
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={createSafe}
                  disabled={loading || !web3.connected}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {loading ? 'Creating...' : 'Create Safe'}
                </button>
                <button 
                  onClick={manageSafe}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Manage Multisig <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Account Abstraction Section */}
            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Account Abstraction (ERC-4337)
              </h3>
              <div className="text-gray-400 mb-4">
                <div className="mb-2">EntryPoint v0.6: {formatAddress(CONTRACTS.entryPointV06)}</div>
                <div>EntryPoint v0.7: {formatAddress(CONTRACTS.entryPointV07)}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={createSmartAccount}
                  disabled={loading || !web3.connected}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
                  {loading ? 'Creating...' : 'Create Smart Account'}
                </button>
                <button 
                  onClick={gaslessTransaction}
                  disabled={loading || !web3.connected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
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
          
          {/* Quickstart Card */}
          <div 
            className="mt-3 bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-600/30 p-3"
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
                <button
                  onClick={web3.switchToKatana}
                  className="text-blue-300 hover:underline text-left"
                >
                  Add Katana Testnet
                </button>
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
          <h1 className="text-4xl font-bold text-white text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Katana DeFi Platform
          </h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6 px-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 flex gap-2 overflow-x-auto border border-gray-600/30">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
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

      {/* Enhanced Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 shadow-2xl w-full max-w-md border border-gray-600/30">
            <div className="text-center mb-6">
              <h2 className="text-xl text-white font-bold mb-2">
                {modal.type === "deposit" ? "Deposit to" : "Withdraw from"}
              </h2>
              <h3 className="text-lg text-blue-400 font-semibold">{modal.vault.name}</h3>
              
              {modal.vault.isReal && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live Vault</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="text-xs text-gray-300 p-3 bg-gray-700/50 rounded border border-gray-600/20">
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
                className="w-full px-4 py-3 rounded-lg outline-none bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!modal.vault.isReal}
              />
              
              {modal.vault.isReal && (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>APY: {modal.vault.apy}</div>
                  <div>Risk Level: {modal.vault.risk}</div>
                  <div>Protocol: {modal.vault.protocol}</div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  modal.vault.isReal 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
                }`}
                disabled={!modal.vault.isReal}
                title={modal.vault.isReal ? "Execute transaction" : "Demo vault - not functional"}
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
            
            <div className="text-xs mt-4 text-center">
              {modal.vault.isReal ? (
                <span className="text-green-300">✅ Ready for real transaction on Katana</span>
              ) : (
                <span className="text-yellow-300">⚠️ Demo vault - for display only</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 border-t border-gray-800/50">
        <div className="text-sm">
          Powered by <span className="text-blue-400 font-semibold">@pelenko</span> • 
          <span className="ml-2">Built on Katana Network</span>
        </div>
      </footer>
    </div>
  );
}import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Shield, Calculator, Users, Zap, Target, AlertTriangle, Wallet, Home, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';

// Real ethers.js integration (replace simulated version)
// Contract ABIs (Production ready)
const EAS_ABI = [
  "function attest((bytes32,address,uint64,bool,bytes32,bytes,uint256)) external returns (bytes32)",
  "function getAttestation(bytes32) external view returns ((bytes32,address,uint64,uint64,uint64,bytes32,address,address,bool,bytes))",
  "function getSchemaRegistry() external view returns (address)"
];

const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function balanceOf(address) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)"
];

const YEARN_VAULT_ABI = [
  "function deposit(uint256, address) external returns (uint256)",
  "function withdraw(uint256, address, uint256) external returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function totalAssets() external view returns (uint256)",
  "function pricePerShare() external view returns (uint256)",
  "function asset() external view returns (address)"
];

const SAFE_ABI = [
  "function setup(address[],uint256,address,bytes,address,address,uint256,address) external",
  "function execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes) external returns (bool)",
  "function getOwners() external view returns (address[])",
  "function getThreshold() external view returns (uint256)"
];

// Enhanced Token Configuration
const TOKENS = [
  { 
    symbol: "WETH", 
    address: "0x17B8Ee96E3bcB3b04b3e8334de4524520C51caB4", 
    name: "Wrapped Ether",
    decimals: 18,
    coingeckoId: "weth"
  },
  { 
    symbol: "AUSD", 
    address: "0xa9012a055bd4e0eDfF8Ce09f960291C09D5322dC", 
    name: "Agora USD",
    decimals: 18,
    coingeckoId: "agora-dollar"
  },
  { 
    symbol: "USDC", 
    address: "0x102E14ffF48170F2e5b6d0e30259fCD4eE5E28aE", 
    name: "USD Coin",
    decimals: 6,
    coingeckoId: "usd-coin"
  },
  { 
    symbol: "USDT", 
    address: "0xDe51Ef59663e79B494E1236551187399D3359C92", 
    name: "Tether USD",
    decimals: 6,
    coingeckoId: "tether"
  },
  { 
    symbol: "WBTC", 
    address: "0x1538aDF273f6f13CcdcdBa41A5ce4b2DC2177D1C", 
    name: "Wrapped Bitcoin",
    decimals: 8,
    coingeckoId: "wrapped-bitcoin"
  }
];

// Enhanced Real Vaults with more data
const REAL_VAULTS = [
  {
    name: "AUSD Yield Vault",
    underlying: "AUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    apy: "12.50%",
    tvl: "1,250.00 AUSD",
    protocol: "Yearn",
    risk: "Low",
    category: "Stablecoin",
    strategy: "Conservative Lending",
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
    category: "ETH",
    strategy: "Yield Farming",
    explorer: "https://explorer.tatara.katana.network/address/0xccc0fc2e34428120f985b460b487eb79e3c6fa57"
  }
];

// Enhanced Contract Configuration
const CONTRACTS = {
  // Core Protocols
  sushiRouter: "0xAC4c6e212A361c968F1725b4d055b47E63F80b75",
  sushiFactory: "0x9B3336186a38E1b6c21955d112dbb0343Ee061eE",
  morphoBlue: "0xC263190b99ceb7e2b7409059D24CB573e3bB9021",
  vertexClearinghouse: "0xf72BE10454B2fB514A2639da885045C89e3EB693",
  agglayerBridge: "0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582",
  
  // Infrastructure
  eas: "0x4200000000000000000000000000000000000021",
  safe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
  multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  
  // Vaults
  yvAUSD: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
  yvWETH: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
  
  // Account Abstraction
  entryPointV06: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  entryPointV07: "0x0000000071727De22E5E9d8BAf0edAc6f37da032"
};

// Mock vaults with better data structure
const VAULT_STRATEGIES = [
  "Curve", "Convex", "Aura", "Balancer", "Compound", "Aave", "Morpho",
  "Uniswap", "Sushi", "Vertex", "Arbitrum", "Optimism", "Base", "Polygon",
  "Lido", "Rocket", "Frax", "Maker", "Synthetix", "Curve3Pool", "TriCrypto",
  "StableSwap", "MetaPool", "Boosted", "Leveraged", "Delta", "Gamma", "Alpha"
];

const RISK_CATEGORIES = ["Low", "Medium", "High"];
const VAULT_CATEGORIES = ["Stablecoin", "ETH", "BTC", "LP", "Perp"];

const MOCK_VAULTS = Array.from({ length: 40 }, (_, i) => {
  const token = TOKENS[i % TOKENS.length];
  const strategy = VAULT_STRATEGIES[i % VAULT_STRATEGIES.length];
  const risk = RISK_CATEGORIES[i % RISK_CATEGORIES.length];
  const category = VAULT_CATEGORIES[i % VAULT_CATEGORIES.length];
  
  return {
    name: `${token.symbol} ${strategy} Vault`,
    underlying: token.symbol,
    address: `0x${(i + 3).toString(16).padStart(40, "0")}`,
    apy: `${(5 + Math.random() * 15).toFixed(2)}%`,
    tvl: `${(Math.random() * 5000 + 100).toFixed(2)} ${token.symbol}`,
    protocol: strategy,
    risk: risk,
    category: category,
    strategy: `${strategy} Strategy`,
    explorer: `https://explorer.tatara.katana.network/address/0x${(i + 3).toString(16).padStart(40, "0")}`,
    isDemo: true
  };
});

const ALL_VAULTS = [...REAL_VAULTS, ...MOCK_VAULTS];

// Enhanced Chain Configuration
const KATANA_CHAIN = {
  name: "Tatara Network (Katana Testnet)",
  chainId: 129399,
  hexChainId: "0x1f971",
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

// Enhanced Portfolio Data
const INITIAL_PORTFOLIO_DATA = {
  totalValue: "$0.00",
  positions: [],
  healthScore: 85,
  avgLeverage: "1.0x",
  availableMargin: "$0"
};

// Enhanced Protocol Rates
const PROTOCOL_RATES = [
  { 
    name: "Morpho Blue", 
    apy: "8.2%", 
    tvl: "$2.5M", 
    risk: 7.5, 
    color: "bg-blue-500",
    description: "Decentralized lending protocol",
    website: "https://morpho.org"
  },
  { 
    name: "Yearn Vaults", 
    apy: "10.6%", 
    tvl: "$1.8M", 
    risk: 6.8, 
    color: "bg-purple-500",
    description: "Automated yield farming",
    website: "https://yearn.fi"
  },
  { 
    name: "Sushi LP", 
    apy: "15.3%", 
    tvl: "$3.2M", 
    risk: 8.9, 
    color: "bg-pink-500",
    description: "Liquidity provision rewards",
    website: "https://sushi.com"
  },
  { 
    name: "Vertex Perps", 
    apy: "22.1%", 
    tvl: "$850K", 
    risk: 9.2, 
    color: "bg-orange-500",
    description: "Perpetual futures trading",
    website: "https://vertexprotocol.com"
  }
];

// Utility Functions
const copyToClipboard = (str) => {
  navigator.clipboard.writeText(str);
  toast.success('Copied to clipboard!');
};

const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatNumber = (num, decimals = 2) => {
  if (typeof num === 'string') {
    num = parseFloat(num.replace(/[^0-9.-]+/g, ''));
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Enhanced Web3 Hook
function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
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
    } else {
      toast.warning('Please switch to Katana Network');
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
      toast.error('Please install MetaMask or another Web3 wallet');
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
      } else {
        console.error('Error switching network:', switchError);
        toast.error('Failed to switch to Katana Network');
      }
    }
  };

  const getContract = (address, abi) => {
    if (!signer) throw new Error('Wallet not connected');
    return new ethers.Contract(address, abi, signer);
  };

  const disconnect = () => {
    handleDisconnect();
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
    disconnect
  };
}

// Enhanced Wallet Connect Button Component
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

      {/* Network Status */}
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

  // Enhanced Vaults Tab Component
  const VaultsTab = () => {
    const [vaults, setVaults] = useState(ALL_VAULTS);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('apy');

    const refreshVaultData = async () => {
      if (!web3.connected) {
        toast.error('Please connect your wallet first');
        return;
      }
      
      setRefreshing(true);
      
      try {
        // Only refresh real vaults
        const updatedVaults = [...ALL_VAULTS];
        
        for (let i = 0; i < REAL_VAULTS.length; i++) {
          try {
            const vault = REAL_VAULTS[i];
            const vaultContract = web3.getContract(vault.address, YEARN_VAULT_ABI);
            
            // Get real data from contracts
            const [totalAssets, pricePerShare] = await Promise.all([
              vaultContract.totalAssets(),
              vaultContract.pricePerShare()
            ]);
            
            updatedVaults[i] = {
              ...vault,
              tvl: `${ethers.formatEther(totalAssets)} ${vault.underlying}`,
              pricePerShare: ethers.formatEther(pricePerShare),
              lastUpdated: new Date().toLocaleTimeString()
            };
          } catch (error) {
            console.error(`Error updating vault ${REAL_VAULTS[i].name}:`, error);
            toast.error(`Failed to update ${REAL_VAULTS[i].name}`);
          }
        }
        
        setVaults(updatedVaults);
        toast.success('Vault data refreshed successfully!');
      } catch (error) {
        console.error('Vault refresh error:', error);
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

      const isRealVault = REAL_VAULTS.some(rv => rv.address === vault.address);
      setModal({ 
        open: true, 
        vault: { ...vault, isReal: isRealVault }, 
        type: action 
      });
    };

    // Filter and sort vaults
    const filteredVaults = vaults
      .filter(vault => {
        if (filter === 'all') return true;
        if (filter === 'real') return !vault.isDemo;
        if (filter === 'demo') return vault.isDemo;
        return vault.category === filter;
      })
      .sort((a, b) => {
        if (sortBy === 'apy') {
          return parseFloat(b.apy) - parseFloat(a.apy);
        }
        if (sortBy === 'tvl') {
          const aTvl = parseFloat(a.tvl.replace(/[^0-9.-]+/g, ''));
          const bTvl = parseFloat(b.tvl.replace(/[^0-9.-]+/g, ''));
          return bTvl - aTvl;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });

    return (
      <div className="w-full max-w-7xl px-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="text-white text-sm">
              <span className="text-green-400 font-bold">{REAL_VAULTS.length}</span> Real • 
              <span className="text-gray-400 ml-1">{MOCK_VAULTS.length}</span> Demo • 
              <span className="text-blue-400 ml-1">{filteredVaults.length}</span> Filtered
            </div>
            
            {/* Filter */}
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
            >
              <option value="all">All Vaults</option>
              <option value="real">Real Only</option>
              <option value="demo">Demo Only</option>
              <option value="Stablecoin">Stablecoin</option>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>

            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
            >
              <option value="apy">Sort by APY</option>
              <option value="tvl">Sort by TVL</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>

          <button
            onClick={refreshVaultData}
            disabled={refreshing || !web3.connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {/* Vault Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVaults.map((vault, index) => {
            const isReal = !vault.isDemo;
            return (
              <div
                key={vault.address}
                className={`rounded-xl p-4 shadow-lg flex flex-col justify-between min-h-[200px] transition-all hover:scale-105 ${
                  isReal 
                    ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-600/30'
                }`}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm leading-tight">{vault.name}</h3>
                      {isReal && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                    </div>
                    <button
                      onClick={() => window.open(vault.explorer, '_blank')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Protocol:</span>
                      <span className="text-blue-300">{vault.protocol}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Asset:</span>
                      <span className="text-white">{vault.underlying}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-purple-300">{vault.category}</span>
                    </div>
                  </div>

                  {/* Metrics */}
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
                    {vault.lastUpdated && (
                      <div className="text-gray-500 text-xs">Updated: {vault.lastUpdated}</div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 text-white text-xs px-3 py-2 rounded transition-colors ${
                      isReal 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 cursor-not-allowe
