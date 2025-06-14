// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // tambahkan loading
  const [sessionTimer, setSessionTimer] = useState(null);

  const clearAutoLogout = useCallback(() => {
    if (sessionTimer) clearTimeout(sessionTimer);
  }, [sessionTimer]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    localStorage.clear();
    clearAutoLogout();
  }, [clearAutoLogout]);

  const startAutoLogout = useCallback(() => {
    clearAutoLogout();
    const timer = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000); // Auto logout 5 menit
    setSessionTimer(timer);
  }, [clearAutoLogout, handleLogout]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) startAutoLogout();
      else clearAutoLogout();
      setLoading(false); // baru set loading setelah status diketahui
    });

    return () => unsubscribe();
  }, [startAutoLogout, clearAutoLogout]);

  return { currentUser, handleLogout, loading };
};

export default useAuth;
