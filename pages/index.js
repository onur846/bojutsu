import WalletConnectButton from "../components/WalletConnectButton";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('/bojutsu-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

      {/* Header and wallet button */}
      <div className="relative z-10 w-full flex justify-center items-center pt-24 pb-10">
        <h1 className="text-4xl font-bold text-white flex-1 text-center">
          Katana Vault Aggregator
        </h1>
        <div className="absolute right-10">
          <WalletConnectButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 justify-center items-start mt-16">
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

      {/* Footer */}
      <footer className="relative z-10 text-center mt-16 mb-10 text-gray-400">
        Powered by Onur X : @pelenko
      </footer>
    </div>
  );
}
