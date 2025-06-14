import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { LogIn, LogOut } from 'lucide-react'

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors, isPending } = useConnect()

  const shortAddr = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : ""

  if (!isConnected) {
    // use the first available connector
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="px-5 py-2 rounded-full bg-black text-white hover:bg-gray-900 transition flex items-center gap-2 shadow-lg"
        style={{ fontWeight: "bold", fontSize: "1rem" }}
      >
        <LogIn size={18} />
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-900 font-mono" style={{ fontWeight: 600 }}>
        {shortAddr(address)}
      </span>
      <button
        onClick={() => disconnect()}
        className="px-3 py-1 rounded-full bg-gray-800 text-white hover:bg-red-600 transition flex items-center gap-1"
        style={{ fontWeight: "bold" }}
        title="Disconnect"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}
