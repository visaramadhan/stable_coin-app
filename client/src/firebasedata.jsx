// firebasedata.jsx
import { db } from "./firebaseconfig.jsx";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function getGanacheAddressByEmail(email) {
  if (!email) {
    console.error("❌ Email tidak boleh kosong");
    throw new Error("Email tidak boleh kosong");
  }

  try {
    // Koleksi Firestore disesuaikan (users)
    const userCollectionRef = collection(db, "user");

    const q = query(userCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`⚠️ Tidak ada dokumen user dengan email: ${email}`);
      return null;
    }

    // Ambil ganacheAddress dari dokumen pertama (anggap 1 email = 1 user)
    const docData = querySnapshot.docs[0].data();
    const ganacheAddress = docData.ganacheAddress;

    console.log("✅ Data user ditemukan:", docData);

    return ganacheAddress || null;
  } catch (error) {
    console.error("❌ Gagal mengambil alamat Ganache:", error);
    return null;
  }
}
