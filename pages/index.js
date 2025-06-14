import WalletConnectButton from "../components/WalletConnectButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d101a] flex flex-col">
      {/* Header bar with centered title and button top right */}
      <div className="relative w-full pt-17 pb-10">
        {/* Centered header */}
        <h1 className="absolute left-1/2 top-2 -translate-x-1/2 text-4xl font-bold text-white">
          Katana Vault Aggregator
        </h1>
        {/* Top right button */}
        <div className="absolute right-10 top-2">
          <WalletConnectButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-start mt-6">
        <div className="bg-[#181c26] rounded-2xl p-10 shadow-lg min-w-[600px]">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2">Vault</th>
                <th className="pb-2">Underlying</th>
                <th className="pb-2">APY</th>
                <th className="pb-2">TVL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2">yvWETH</td>
                <td>WETH</td>
                <td>13.00%</td>
                <td>1,234.56 WETH</td>
              </tr>
              <tr>
                <td className="py-2">yvAUSD</td>
                <td>AUSD</td>
                <td>8.90%</td>
                <td>9,876.54 AUSD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="text-center mt-12 mb-8 text-gray-400">
        Powered by @pelenko
      </footer>
    </div>
  );
}
