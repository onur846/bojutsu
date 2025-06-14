"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <button onClick={() => disconnect()} className="bg-red-600 text-white px-4 py-2 rounded-xl">
        Disconnect ({address.slice(0, 6)}...{address.slice(-4)})
      </button>
    );
  return (
    <button onClick={() => connect()} className="bg-green-600 text-white px-4 py-2 rounded-xl">
      Connect Wallet
    </button>
  );
}

