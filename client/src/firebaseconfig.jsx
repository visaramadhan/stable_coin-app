import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgh2jqPN7PzYemjLKaPf3s0Owz57XRH94",
  authDomain: "stable-coin-666ec.firebaseapp.com",
  projectId: "stable-coin-666ec",
  storageBucket: "stable-coin-666ec.firebasestorage.app",
  messagingSenderId: "477188489202",
  appId: "1:477188489202:web:a366c3b24281399d21b56b",
  measurementId: "G-NVK6Q6246E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Session persistence diaktifkan secara lokal.");
  })
  .catch((error) => {
    console.error("❌ Gagal set persistence:", error);
  });
