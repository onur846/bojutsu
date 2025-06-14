import { useEffect, useState } from "react";
import { fetchVaultsTVL } from "../lib/vaults";
import WalletConnectButton from "../components/WalletConnectButton";

export default function Home() {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaultsTVL().then(data => {
      setVaults(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">
          Katana Vault Aggregator
        </h1>
        <div className="flex justify-center mb-8">
          <WalletConnectButton />
        </div>
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 text-left">Vault</th>
                <th className="py-2 text-left">Underlying</th>
                <th className="py-2 text-left">APY</th>
                <th className="py-2 text-left">TVL</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (
                vaults.map(v => (
                  <tr key={v.address} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-3 font-medium">{v.name}</td>
                    <td>{v.underlying}</td>
                    <td>{(v.apy * 100).toFixed(2)}%</td>
                    <td>{v.tvl.toLocaleString()} {v.underlying}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-center text-gray-400 mt-8">
          <span>
             Powered by @pelenko
          </span>
        </div>
      </div>
    </div>
  );
}
