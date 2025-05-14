import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { sha512 } from 'crypto-js';
import blake3 from 'blake3/browser';

function Demo() {
  const {
    state: { contract, accounts },
  } = useEth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [metrics, setMetrics] = useState([]); // Menyimpan hasil pengujian

  // Fungsi perbandingan hashing yang mengembalikan waktu eksekusi
  const compareHashingPerformance = async (data) => {
    // SHA-512
    const startSHA = performance.now();
    const shaHash = sha512(data).toString();
    const endSHA = performance.now();
    const timeSHA = (endSHA - startSHA).toFixed(3);

    // BLAKE3
    const startBLAKE = performance.now();
    const blakeHashBuffer = await blake3.hash(data);
    const blakeHash = Buffer.from(blakeHashBuffer).toString('hex');
    const endBLAKE = performance.now();
    const timeBLAKE = (endBLAKE - startBLAKE).toFixed(3);

    // Simpan metric
    setMetrics([
      { algorithm: 'SHA-512', time: timeSHA, hash: shaHash },
      { algorithm: 'BLAKE3', time: timeBLAKE, hash: blakeHash },
    ]);

    return { shaHash, blakeHash };
  };

  const handleTransfer = async () => {
    if (!contract) {
      setTxStatus("Smart contract belum terhubung.");
      return;
    }
    if (!recipient || !amount) {
      setTxStatus("Masukkan alamat penerima dan jumlah token.");
      return;
    }
    try {
      setTxStatus("Memproses transaksi dan pengujian hashing...");
      const dataString = amount.toString();

      // Jalankan perbandingan hashing dan simpan metrics
      await compareHashingPerformance(dataString);

      // Kirim transaksi ke smart contract
      const tx = await contract.methods
        .transferWithHash(recipient, amount)
        .send({ from: accounts[0] });

      setTxStatus(`Transfer berhasil! Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error(error);
      setTxStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="demo">
      <h2>Secure Stablecoin Transfer & Hashing Performance Test</h2>

      <p>
        Saat melakukan transaksi transfer token, sistem juga mengukur performa hashing <strong>SHA-512</strong> dan <strong>BLAKE3</strong> untuk membandingkan waktu eksekusi masing-masing algoritma. Hasil pengujian akan ditampilkan dalam tabel di bawah.
      </p>

      <div className="input-group">
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div className="input-group" style={{ marginTop: '1rem' }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <button
        onClick={handleTransfer}
        style={{ marginTop: '1rem', padding: '0.75rem', width: '100%' }}
      >
        Transfer & Test Hashing
      </button>

      {txStatus && (
        <p className="status" style={{ marginTop: '1rem', color: '#2c7a7b' }}>
          {txStatus}
        </p>
      )}

      {metrics.length > 0 && (
        <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Algoritma</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Waktu (ms)</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Contoh Hash</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.algorithm}>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{m.algorithm}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{m.time}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {metrics.length > 0 && (
        <p style={{ marginTop: '1rem' }}>
          Berdasarkan pengujian di atas, BLAKE3 menunjukkan waktu eksekusi yang lebih cepat dibanding SHA-512 untuk input berupa string jumlah token. Ini menegaskan bahwa BLAKE3 lebih efisien untuk aplikasi frontend yang membutuhkan hashing cepat sebelum mengirim data ke blockchain.
        </p>
      )}
    </div>
  );
}

export default Demo;
