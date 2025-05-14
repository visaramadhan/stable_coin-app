import React, { useEffect, useState } from "react";
import Web3 from "web3";
import SecureStablecoin from "../contracts/SecureStablecoin.json";
import { blake3 } from '@noble/hashes/blake3';
import { sha512 } from '@noble/hashes/sha512';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid} from "recharts";


function HashedTransferForm() {
  const [benchmarkData, setBenchmarkData] = useState([]);
  const [shaAvg, setShaAvg] = useState(null);
  const [blakeAvg, setBlakeAvg] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [dataToHash, setDataToHash] = useState("");
  const [hashType, setHashType] = useState("SHA-512");
  const [lastHash, setLastHash] = useState("");
  const [hashTime, setHashTime] = useState(null);


  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

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
        alert("Contract not deployed on this network");
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !recipient || !amount || !dataToHash) return;
  
    try {
      const encoded = new TextEncoder().encode(dataToHash);
      const t0 = performance.now();
      const hash = hashType === "SHA-512"
        ? sha512(encoded)
        : blake3(encoded);
      const t1 = performance.now();
  
      const hexHash = Array.from(hash)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
  
      setLastHash(hexHash);
      setHashTime((t1 - t0).toFixed(3));
  
      const funcTransfer = hashType === "SHA-512"
        ? "transferWithSHA512Hash"
        : "transferWithBLAKE3Hash";
  
      await contract.methods[funcTransfer](
        recipient,
        Web3.utils.toWei(amount, "ether"),
        hexHash
      ).send({ from: account });
  
      alert("✅ Transfer successful");
    } catch (err) {
      console.error(err);
      alert("❌ Transfer failed");
    }
  };
  

  // Benchmarking function
  const handleBenchmark = async () => {
    console.log("Benchmark clicked");
  
    try {
      const input = dataToHash || "default test input";
      const encoded = new TextEncoder().encode(input);
      const iterations = 100;
  
      // SHA-512
      console.log("Running SHA-512...");
      for (let i = 0; i < 5; i++) sha512(encoded);
      const t0 = performance.now();
      for (let i = 0; i < iterations; i++) {
        sha512(encoded);
      }
      const t1 = performance.now();
      const avgSHA = (t1 - t0) / iterations;
  
      // BLAKE3
      console.log("Running BLAKE3...");
      for (let i = 0; i < 5; i++) blake3(encoded);
      const t2 = performance.now();
      for (let i = 0; i < iterations; i++) {
        blake3(encoded);
      }
      const t3 = performance.now();
      const avgBLAKE = (t3 - t2) / iterations;
  
      setShaAvg(avgSHA.toFixed(3));
      setBlakeAvg(avgBLAKE.toFixed(3));
  
      setBenchmarkData(prev => [
        ...prev,
        {
          name: `#${prev.length + 1}`,
          SHA512: parseFloat(avgSHA.toFixed(3)),
          BLAKE3: parseFloat(avgBLAKE.toFixed(3)),
        }
      ]);
      alert(
        `SHA-512 avg: ${avgSHA.toFixed(3)} ms\n` +
        `BLAKE3 avg: ${avgBLAKE.toFixed(3)} ms`
      );
    } catch (err) {
      console.error("Benchmark error:", err);
      alert("Benchmark failed. See console for details.");
    }
  };
  
  

  return (
    <div style={styles.container}>
      <h2>🔐 Hashed Transfer</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Amount in SUSD"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Data to hash"
          value={dataToHash}
          onChange={(e) => setDataToHash(e.target.value)}
          style={styles.input}
        />
        <select
          value={hashType}
          onChange={(e) => setHashType(e.target.value)}
          style={styles.select}
        >
          <option value="SHA-512">SHA-512</option>
          <option value="BLAKE3">BLAKE3</option>
        </select>
        <button type="submit" style={styles.button}>Send Hashed Transfer</button>
      </form>

      <button onClick={handleBenchmark} style={{ ...styles.button, backgroundColor: "#007bff", marginTop: "10px" }}>
        🔬 Benchmark Hash Performance
      </button>

      {lastHash && (
        <div style={{ marginTop: "20px", wordBreak: "break-all" }}>
          <p><strong>Hashed ({hashType}):</strong> {lastHash}</p>
          <p><strong>Hashing time:</strong> {hashTime} ms</p>
        </div>
      )}

      {benchmarkData.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>📊 Benchmark Chart (Fixed Size)</h3>
          <LineChart width={}Cue={} height={300} data={benchmarkData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis unit=" ms" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="SHA512" stroke="#8884d8" />
            <Line type="monotone" dataKey="BLAKE3" stroke="#82ca9d" />
          </LineChart>
        </div>
      )}
      {(shaAvg && blakeAvg) && (
        <div style={{ marginTop: "20px" }}>
          <h4>🔬 Benchmark Results (avg of 50 Hashing)</h4>
          <p><strong>SHA-512:</strong> {shaAvg} ms</p>
          <p><strong>BLAKE3:</strong> {blakeAvg} ms</p>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px #ddd",
    backgroundColor: "#fff"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px"
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default HashedTransferForm;
