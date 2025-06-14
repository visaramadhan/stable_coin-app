import { useState, useEffect, useRef } from "react";
import { JsonRpcProvider, formatEther } from "ethers";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import SectionCard from "./SectionCard.jsx";
import HashedTransferForm from "./HashedTransferForm.jsx";

import { auth } from "../firebaseconfig.jsx";
import { getGanacheAddressByEmail } from "../firebasedata.jsx";
import "../pages/register.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ethBalance, setEthBalance] = useState("...");
  const [walletAddress, setWalletAddress] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Refs
  const profileRef = useRef(null);
  const topupRef = useRef(null);
  const transaksiRef = useRef(null);
  const hashingRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      try {
        const address = await getGanacheAddressByEmail(userEmail);
        setWalletAddress(address);

        const provider = new JsonRpcProvider("http://127.0.0.1:7545");
        const balance = await provider.getBalance(address);
        setEthBalance(formatEther(balance));
      } catch (err) {
        setError("Gagal memuat data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <main className="main-content" tabIndex={-1}>
        <header className="main-header">Dashboard Stable-Coin</header>

        <SectionCard title="👤 Profile" ref={profileRef}>
          <p>Email: {userEmail}</p>
          <p>Wallet: {walletAddress || "-"}</p>
          <p>Saldo ETH: {ethBalance} ETH</p>
        </SectionCard>

        <SectionCard title="💰 Simulasi Top Up" ref={topupRef}>
          <p>Fitur ini memungkinkan pengguna untuk melakukan top-up saldo menggunakan stable-coin... </p>
        </SectionCard>

        <SectionCard title="🔁 Transaksi" ref={transaksiRef}>
          <p>Fitur transaksi memungkinkan pengguna melakukan pengiriman atau penerimaan stable-coin...</p>
          <div style={{ marginTop: "2rem" }}>
            <HashedTransferForm walletAddress={walletAddress} />
          </div>
        </SectionCard>

        <SectionCard title="🧪 Uji Hashing" ref={hashingRef}>
          <p>Fitur ini memungkinkan pengguna untuk menguji algoritma hashing...</p>
        </SectionCard>

        <SectionCard title="ℹ️ Tentang" ref={aboutRef}>
          <p>Stablecoin adalah jenis cryptocurrency yang dirancang untuk menjaga nilai tetap stabil...</p>
        </SectionCard>
      </main>
    </div>
  );
}
