import "../styles/globals.css";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function App({ Component, pageProps }) {
  return (
    <div>
      {/* Top Bar */}
      <div className="w-full flex justify-end items-center px-6 py-4 border-b" style={{position: "sticky", top: 0, zIndex: 20, background: "#fff"}}>
        <WalletConnectButton />
      </div>
      {/* Page Content */}
      <Component {...pageProps} />
    </div>
  );
}
