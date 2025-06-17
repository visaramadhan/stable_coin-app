import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs
} from "firebase/firestore";
import { auth, db } from "../firebaseconfig.jsx";

const ProfileSection = ({ email, address, balanceEth }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn("⚠️ Tidak ada user login");
      return;
    }

    setLoading(true);
    try {
      const userDocId = currentUser.uid;
      const transaksiRef = collection(db, "user", userDocId, "transaction");
      const transaksiSnapshot = await getDocs(transaksiRef);

      const transaksiData = transaksiSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      transaksiData.sort(
        (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      );
      setTransactions(transaksiData);
    } catch (err) {
      console.error("❌ Gagal mengambil transaksi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (!address) {
    return <p>🔄 Memuat data profil... (alamat wallet belum tersedia)</p>;
  }

  return (
    <div>
      <h3>👤 Profil Pengguna</h3>

      <div className="wallet-section">
        <table className="wallet-table">
          <tbody>
            <tr>
              <td>Email</td>
              <td>| {email}</td>
            </tr>
            <tr>
              <td>Alamat Wallet</td>
              <td>| {address}</td>
            </tr>
            <tr>
              <td>Saldo (ETH)</td>
              <td>| {balanceEth ?? "Loading..."} ETH</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        <h4>📑 Riwayat Transaksi</h4>
        <button className="register-btn" onClick={fetchTransactions} disabled={loading}>
          {loading ? "🔄 Memuat..." : "🔄 Refresh Riwayat"}
        </button>
      </div>

      {transactions.length === 0 ? (
        <p>❗ Riwayat transaksi belum tersedia atau kosong.</p>
      ) : (
        <div className="wallet-section">
          <table className="wallet-table">
            <thead>
              <tr>
                <th>Hash</th>
                <th>To (Alamat)</th>
                <th>Amount</th>
                <th style={{ maxWidth: 100 }}>Hash Type</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ maxWidth: 300, wordWrap: "break-word" }}>{tx.hash}</td>
                  <td>{tx.recipient}</td>
                  <td>{tx.amount}</td>
                  <td style={{ maxWidth: 200, wordWrap: "break-word" }}>{tx.hashType}</td>
                  <td style={{ maxWidth: 300, wordWrap: "break-word" }}>
                    {tx.timestamp?.seconds
                      ? new Date(tx.timestamp.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
