import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseconfig.jsx";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./register.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, "user"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.ganacheAddress) {
          localStorage.setItem("ganacheAddress", userData.ganacheAddress);
        }
        localStorage.setItem("user_email", user.email);
        navigate("/dashboard");  // langsung arahkan
      } else {
        setError("Data user tidak ditemukan di database.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login gagal. Periksa kembali email atau password.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-container">
      <div className="register-box">
        <div className="app-header">
          <h1>Stable Coin Simulation</h1>
          <h3>SHA-512 vs BLAKE3</h3>
        </div>

        {error && <p className="register-error">{error}</p>}

        <form onSubmit={handleLogin} className="register-form" autoComplete="on">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="register-login-link">
          Belum punya akun?{" "}
          <Link to="/register" className="link">Daftar di sini</Link>
        </p>

        <div className="register-login-link">
          <Link to="/forgot-password" className="link">Lupa password?</Link>
        </div>

        <p className="register-login-link">
          Development by:<br />
          <a href="https://www.telkomuniversity.ac.id/" className="link" target="_blank" rel="noreferrer">
            IVAN DANIAR | TELKOM UNIVERSITY
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
