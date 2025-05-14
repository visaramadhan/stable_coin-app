import React from "react";
import HashedTransferForm from "./components/HashedTransferForm"; 


//     } catch (error) {
//       console.error("Error during transfer:", error);
//       setTxStatus("Terjadi kesalahan saat memproses transaksi.");
//     }
//   };

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>💰 Secure Stablecoin (SUSD)</h1>
      <HashedTransferForm />
    </div>
  );
}

export default App;
