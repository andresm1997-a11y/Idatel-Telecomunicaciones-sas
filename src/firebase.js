import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyCQgvBHQ5CJ6W_YsL4YGB8BOHei0eceQW4",
  authDomain: "idatel-cms.firebaseapp.com",
  projectId: "idatel-cms",
  storageBucket: "idatel-cms.firebasestorage.app",
  messagingSenderId: "53744902052",
  appId: "1:53744902052:web:e8ac0a2259ca75e440ab31"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
