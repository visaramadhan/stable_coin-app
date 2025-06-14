import React, { useState } from "react";

const TopupForm = () => {
  const [amount, setAmount] = useState("");

  const handleTopup = () => {
    alert(`Top-up sebesar ${amount} ETH diproses.`);
    setAmount("");
  };

  return (
    <div className="card">
      <h3>Top-up Saldo ETH</h3>
      <input
        type="number"
        placeholder="Masukkan jumlah ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleTopup}>Top-up</button>
    </div>
  );
};

export default TopupForm;
