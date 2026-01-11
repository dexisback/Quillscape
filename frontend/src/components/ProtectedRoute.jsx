import React from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
export default function ProtectedRoute({children}) {
    const { user } = useAuth();
  
    //else:
    if(!user){
        //user is not found, return to auth page (hero section)
        return <Navigate to="/" replace></Navigate>  //without replace, user can jugaad se open /dashboard. with replace, the entire history of everything happened up until now is replaced
    }


    //if user exists, return them the children, let them see the content
  return children;
}

