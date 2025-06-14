import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function WalletConnectButton() {
  const { connect } = useConnect();
  return (
    <button onClick={() => connect({ connector: injected() })}>
      Connect Wallet
    </button>
  );
}
