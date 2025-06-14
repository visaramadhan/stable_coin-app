import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseconfig"; // path ke konfigurasi Firebase-mu

export default function useAddressEmailMap() {
  const [map, setMap] = useState({});

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const snapshot = await getDocs(collection(db, "user")); // ambil semua dokumen dari koleksi users
        const tempMap = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.ganacheAddress && data.email) {
            // simpan dengan lowercase biar konsisten saat dicari
            tempMap[data.ganacheAddress.toLowerCase()] = data.email;
          }
        });

        setMap(tempMap);
      } catch (error) {
        console.error("❌ Gagal ambil mapping address-email dari Firestore:", error);
      }
    };

    fetchMap();
  }, []);

  return map;
}
