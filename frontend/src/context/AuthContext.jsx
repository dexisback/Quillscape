//making the boilerplate
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
    },[auth])  //as soon as auth happens (or changes),load this shii
//2: listening for logout:
            const logout = ()=>{signOut(auth)}

return(<>
    <AuthContext.Provider value={{ user, loading, logout }}>
        {!loading && children}
    </AuthContext.Provider>

</>) 
}
//getauth se get user
//


            //2: simple logout function to share globally     (why no login function? because login function is not needed globally, once login is done us button ka kaam khtm. but logout button will be shared everywhere)

//render "children" inside of <AuthContext.Provider value=something >


export const useAuth = ()=> useContext(AuthContext); 