import React from "react";
import { useState, useEffect} from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext } from "react";
import Auth from "../pages/Auth";

 const AuthContext= createContext();


 export const AuthProvider = ({children}) =>{
    const [user, setUser]= useState("");
    const [loading, setLoading] = useState(true);
    const auth = getAuth();


            //1:listening for login/logout changes here:

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (currentUser)=>{setUser(currentUser); setLoading(false);})
        return () => unsubscribe()
    },[auth])  
            //2: listening for logout:
            const logout = ()=>{signOut(auth)}


return(<>
    <AuthContext.Provider value={{ user, loading, logout }}>
        {!loading && children}
    </AuthContext.Provider>

</>) 
}

export const useAuth = ()=> useContext(AuthContext); 