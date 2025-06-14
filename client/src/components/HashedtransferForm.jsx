import React, { useEffect, useState } from "react";
import Web3 from "web3";
import SecureStablecoin from "../contracts/SecureStablecoin.json";
import { blake3 } from "@noble/hashes/blake3";
import { sha512 } from "@noble/hashes/sha2";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseconfig.jsx";
import useAuth from "../hooks/useAuth";
import "../pages/register.css";

function HashedTransferForm() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedGanache, setSelectedGanache] = useState("");
  const [amount, setAmount] = useState("");
  const [dataToHash, setDataToHash] = useState("");
  const [hashType, setHashType] = useState("SHA-512");
  const [lastHash, setLastHash] = useState("");
  const [hashTime, setHashTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const loadAll = async () => {
      try {
        await loadBlockchainData();
        await loadUserList();
      } catch (err) {
        console.error("⛔ Error saat loading:", err);
        alert("Gagal memuat data awal. Periksa jaringan atau MetaMask.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const loadBlockchainData = async () => {
    if (!window.ethereum) {
      alert("❌ MetaMask tidak ditemukan.");
      return;
    }

    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = SecureStablecoin.networks[networkId];
      if (networkData) {
        const stablecoinContract = new web3.eth.Contract(
          SecureStablecoin.abi,
          networkData.address
        );
        setContract(stablecoinContract);
      } else {
        alert("Smart contract belum dideploy di jaringan ini.");
      }
    } catch (error) {
      console.error("MetaMask error:", error);
      throw error;
    }
  };

  const loadUserList = async () => {
    const snapshot = await getDocs(collection(db, "user"));
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      email: doc.data().email,
      ganacheAddress: doc.data().ganacheAddress,
    }));
    setUserList(users);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !selectedEmail || !selectedGanache || !amount || !dataToHash) {
      return alert("⚠️ Harap isi semua kolom.");
    }

    setSending(true);

    try {
      const encoded = new TextEncoder().encode(dataToHash);
      const t0 = performance.now();

      let hash, funcTransfer;
      if (hashType === "SHA-512") {
        const fullSha = sha512(encoded);
        hash = fullSha.slice(0, 32);
        funcTransfer = "transferWithSHA512Hash";
      } else if (hashType === "BLAKE3") {
        hash = blake3(encoded);
        funcTransfer = "transferWithBLAKE3Hash";
      } else {
        const sha = sha512(encoded);
        const blake = blake3(encoded);
        hash = new Uint8Array([...sha, ...blake]);
        funcTransfer = "transferWithCombinedHash";
      }

      const t1 = performance.now();
      const hexHash = "0x" + Array.from(hash).map(b => b.toString(16).padStart(2, "0")).join("");
      setLastHash(hexHash);
      setHashTime((t1 - t0).toFixed(3));

      const amountInWei = Web3.utils.toWei(amount.toString(), "ether");

      if (!contract.methods[funcTransfer]) {
        return alert("❌ Metode tidak ditemukan di smart contract.");
      }

      await contract.methods[funcTransfer](selectedGanache, amountInWei, hexHash)
        .send({ from: account });

      const q = query(collection(db, "user"), where("email", "==", user.email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("❌ User login tidak ditemukan di Firestore.");
      }

      const userDocId = snapshot.docs[0].id;
      const transaksiCollectionRef = collection(db, "user", userDocId, "transaction");

      await addDoc(transaksiCollectionRef, {
        sender: account,
        recipient: selectedGanache,
        email: selectedEmail,
        amount,
        hash: hexHash,
        hashType,
        timestamp: serverTimestamp(),
      });

      alert("✅ Transfer berhasil dan dicatat ke Firestore!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal melakukan transfer.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>⏳ Memuat data blockchain dan pengguna...</p>;

  return (
    <div className="hashed-transfer-container">
      <h2>🔐 Hashed Transfer</h2>
      <form onSubmit={handleSubmit} className="hashed-transfer-form">
        <label>
          Pilih Email Penerima
          <select
            value={selectedEmail}
            onChange={(e) => {
              const email = e.target.value;
              setSelectedEmail(email);
              const user = userList.find((u) => u.email === email);
              setSelectedGanache(user?.ganacheAddress || "");
            }}
            required
          >
            <option value="">-- Pilih Email --</option>
            {userList.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          Amount (SUSD)
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>

        <label>
          Data untuk Hash
          <input type="text" value={dataToHash} onChange={(e) => setDataToHash(e.target.value)} required />
        </label>

        <label>
          Algoritma Hash
          <select value={hashType} onChange={(e) => setHashType(e.target.value)}>
            <option value="SHA-512">SHA-512</option>
            <option value="BLAKE3">BLAKE3</option>
            <option value="SHA512+BLAKE3">Gabungan SHA-512 + BLAKE3</option>
          </select>
        </label>

        <button type="submit" className="register-btn" disabled={sending}>
          {sending ? "⏳ Mengirim..." : "🚀 Kirim Coin"}
        </button>
      </form>

      {lastHash && (
        <div className="hash-result">
          <p><strong>Hash ({hashType}):</strong> {lastHash}</p>
          <p><strong>Waktu Hash:</strong> {hashTime} ms</p>
        </div>
      )}
    </div>
  );
}

export default HashedTransferForm;
