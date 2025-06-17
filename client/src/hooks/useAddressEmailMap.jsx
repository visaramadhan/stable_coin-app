import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseconfig";

export default function useUserData() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, "user", currentUser.uid);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setUserData(snapshot.data());
        } else {
          console.warn("⚠️ Data user tidak ditemukan.");
        }
      } catch (error) {
        console.error("❌ Gagal ambil data user dari Firestore:", error);
      }
    };

    fetchUserData();
  }, []);

  return userData;
}
