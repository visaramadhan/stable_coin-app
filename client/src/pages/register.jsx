import React, { useState } from "react";
import { auth, db } from "../firebaseconfig.jsx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./register.css"; // pastikan file ini ada

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ganacheAddress, setGanacheAddress] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan data user ke Firestore dengan ID = user.uid
      await setDoc(doc(db, "user", user.uid), {
        email: user.email,
        ganacheAddress: ganacheAddress,
      });

      alert("Akun berhasil dibuat!");
      // window.location.href = "/login"; // atau gunakan navigate jika react-router
    } catch (err) {
      console.error("Gagal mendaftar:", err);
      setError("Gagal mendaftar. Periksa kembali email dan password.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="app-header">
          <h1>Stable Coin Simulation</h1>
          <h3>SHA-512 vs BLAKE3</h3>
        </div>

        <h2 className="register-title">Register</h2>
        {error && <p className="register-error">{error}</p>}
        <form onSubmit={handleRegister} className="register-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>No. Telepon</label>
          <input
            type="text"
            value={ganacheAddress}
            onChange={(e) => setGanacheAddress(e.target.value)}
            required
          />

          <button type="submit" className="register-btn">
            Daftar
          </button>
        </form>
        <p className="register-login-link">
          Sudah punya akun?{" "}
          <a href="/login" className="link">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
