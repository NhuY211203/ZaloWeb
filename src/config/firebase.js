import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// const firebaseConfig = { 
//   apiKey : "AIzaSyC_nG5D_Jm95q4DIqfp16f2zoO60ChmVO8" , 
//   authDomain : "echoapp-ac308.firebaseapp.com" , 
//   projectId : "echoapp-ac308" , 
//   storageBucket : "echoapp-ac308.firebasestorage.app" , 
//   messagingSenderId : "1074105140138" , 
//   appId : "1:1074105140138:web:69cb84ee861d9baa90e1d3" , 
//   measurementId : "G-QL17R4HFZ2" 
// };
const firebaseConfig = { 
  apiKey : "AIzaSyAUvtwB4NqNm50VmDS9YHL38U-yNoXqY4k" , 
  authDomain : "expo-7b3c1.firebaseapp.com" , 
  projectId : "expo-7b3c1" , 
  storageBucket : "expo-7b3c1.firebasestorage.app" , 
  messagingSenderId : "843660951518" , 
  appId : "1:843660951518:web:186f910e8f792a8fd6a74f" , 
  measurementId : "G-HB5F1XY7LS" 
};

const app = initializeApp(firebaseConfig);
const authentication = getAuth(app);
const db = getFirestore(app);
export {authentication, db};