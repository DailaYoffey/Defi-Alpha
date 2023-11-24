import { useState, useEffect } from "react";

const MetamaskButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    checkIfConnected();
  }, []);

  const checkIfConnected = () => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setIsConnected(true);
      setAccounts([window.ethereum.selectedAddress]);
    } else {
      setIsConnected(false);
      setAccounts([]);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccounts(accounts);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });
      setIsConnected(false);
      setAccounts([]);
    } catch (error) {
      console.error("Failed to disconnect from wallet:", error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <button className="disconnect-button" onClick={disconnectWallet} style={{ color: "#ffffff" }}>
          <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'>Disconnect</h3>
        </button>
      ) : (
        <button className="connect-button" onClick={connectWallet} style={{ color: "#ffffff" }}>
            <h3 className='font-extrabold text-[20px] text-white pt-1 hover:text-red-400 hover:cursor-pointer z-20'>Connect Wallet</h3>
        </button>
      )}
    </div>
  );
};

export default MetamaskButton;
