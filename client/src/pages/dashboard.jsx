import React, { useEffect, useState, useCallback, Suspense } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ethers } from "ethers";
import { auth } from "../firebaseconfig";
import HashedTransferForm from "../components/HashedTransferForm.jsx";
import ProfileSection from "./ProfileSection.jsx";
import "./dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balanceUsd, setBalanceUsd] = useState(null);
  const [balanceEth, setBalanceEth] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [isFetchingWallet, setIsFetchingWallet] = useState(false);

  const clearStates = () => {
    setUserEmail(null);
    setWalletAddress(null);
    setBalanceUsd(null);
    setBalanceEth(null);
  };

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      clearStates();
      if (onLogout) onLogout();
    } catch (error) {
      console.error("❌ Error saat logout:", error);
    }
  }, [onLogout]);

  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();
      const price = data?.ethereum?.usd;
      return isNaN(price) ? null : price;
    } catch (error) {
      console.error("❌ Gagal fetch harga ETH:", error);
      return null;
    }
  };

  const fetchWalletData = useCallback(async () => {
    if (isFetchingWallet) return;

    try {
      setIsFetchingWallet(true);

      if (!window.ethereum) {
        alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask.");
        return;
      }

      let accounts = await window.ethereum.request({ method: "eth_accounts" });
      let address = accounts[0];

      if (!address) {
        const requestedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        address = requestedAccounts[0];
      }

      if (!address) {
        console.warn("⚠️ Tidak ada alamat wallet ditemukan.");
        return;
      }

      setWalletAddress(address);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      const eth = parseFloat(ethers.utils.formatEther(balance));

      setBalanceEth(eth.toFixed(4));

      const price = await fetchEthPrice();
      if (price) {
        const usd = (eth * price).toFixed(2);
        setBalanceUsd(`$${usd}`);
      }

    } catch (error) {
      console.error("❌ Gagal ambil data wallet:", error);
    } finally {
      setIsFetchingWallet(false);
    }
  }, [isFetchingWallet]);

  useEffect(() => {
    let timer = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchWalletData();

        timer = setTimeout(() => {
          handleLogout();
        }, 30 * 60 * 1000);
      } else {
        clearStates();
      }
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [handleLogout, fetchWalletData]);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            email={userEmail}
            address={walletAddress}
            balanceEth={balanceEth}
            balanceUsd={balanceUsd}
          />
        );
      case "hash":
        return (
          <Suspense fallback={<p>⏳ Memuat form hashing...</p>}>
            <HashedTransferForm email={userEmail} address={walletAddress} />
          </Suspense>
        );
      default:
        return (
          <div className="wallet-section">
            <table className="wallet-table">
              <tbody>
                <tr>
                  <td>Email</td>
                  <td>| {userEmail}</td>
                </tr>
                <tr>
                  <td>Alamat Wallet</td>
                  <td>| {walletAddress}</td>
                </tr>
                <tr>
                  <td>Saldo (ETH)</td>
                  <td>| {balanceEth ?? "Loading..."}</td>
                </tr>
                <tr>
                  <td>Saldo (USD)</td>
                  <td>| {balanceUsd ?? "Loading..."}</td>
                </tr>
              </tbody>
            </table>
            <button className="refresh-btn" onClick={fetchWalletData}>
              🔄 Refresh Wallet
            </button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-logo">StableCoin</div>
        <div className="navbar-links">
          <button
            className={`navbar-link ${activeSection === "home" ? "active" : ""}`}
            onClick={() => setActiveSection("home")}
          >
            Home
          </button>
          <button
            className={`navbar-link ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            Profil
          </button>
          <button
            className={`navbar-link ${activeSection === "hash" ? "active" : ""}`}
            onClick={() => setActiveSection("hash")}
          >
            Hashing
          </button>
          {onLogout && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <h2 className="main-header">
          {activeSection === "home"
            ? "HOME"
            : activeSection === "profile"
            ? "Profil Pengguna"
            : activeSection === "hash"
            ? "Uji Hashing"
            : ""}
        </h2>
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;
