import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfvn-nEwuba6aa5WnCPypoPUgXSWbHouA",
  authDomain: "stock-exchange-sim-91ac5.firebaseapp.com",
  projectId: "stock-exchange-sim-91ac5",
  appId: "1:270430886996:web:1cba68366df70c5e5a61c1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();