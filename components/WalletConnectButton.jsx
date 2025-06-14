import { useAccount, useDisconnect } from 'wagmi';
import { useEnsAvatar } from 'wagmi';
import { Copy, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [dropdown, setDropdown] = useState(false);

  // For ENS avatar (shows blockie as fallback)
  const { data: ensAvatar } = useEnsAvatar({ address });
  const shortAddress = address
    ? address.slice(0, 4) + '..' + address.slice(-2)
    : '';

  // Copy address to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  if (!isConnected) {
    // Not connected: show connect button
    return (
      <button
        className="bg-yellow-500 text-blue-900 font-bold rounded-xl px-6 py-2 hover:bg-yellow-400 transition"
        onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
      >
        Connect Wallet
      </button>
    );
  }

  // Connected view:
  return (
    <div className="relative flex flex-col items-end">
      <button
        className="flex items-center gap-2 bg-[#12153a] border border-yellow-400 rounded-xl px-4 py-2 shadow cursor-pointer"
        onClick={() => setDropdown(!dropdown)}
      >
        {/* ENS Avatar or Blockie */}
        <img
          src={
            ensAvatar ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`
          }
          alt="avatar"
          className="w-8 h-8 rounded-full bg-gray-800"
        />
        <span className="text-white font-mono">{shortAddress}</span>
        <Copy
          size={16}
          className="text-blue-400 hover:text-yellow-400"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        />
        <ChevronDown
          size={18}
          className={`ml-1 transition-transform ${dropdown ? 'rotate-180' : ''}`}
        />
      </button>
      {/* Dropdown */}
      {dropdown && (
        <div className="absolute top-14 right-0 min-w-[180px] bg-[#1a1d42] border border-yellow-300 rounded-xl shadow-lg z-50 flex flex-col">
          <button
            className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#232653] text-white rounded-t-xl"
            onClick={() => {
              handleCopy();
              setDropdown(false);
            }}
          >
            <Copy size={16} /> Copy Address
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-left hover:bg-[#232653] text-yellow-400 font-bold rounded-b-xl"
            onClick={() => disconnect()}
          >
            <LogOut size={16} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
