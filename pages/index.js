import WalletConnectButton from "../components/WalletConnectButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d101a] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-10 pt-10 pb-4">
        <h1 className="text-4xl font-bold text-white">
          Katana Vault Aggregator
        </h1>
        <WalletConnectButton />
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

      <footer className="text-center mt-12 text-gray-400">
        Powered by Onur - X : @pelenko
      </footer>
    </div>
  );
}
