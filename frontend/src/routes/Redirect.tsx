import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Redirect({children}: any ): JSX.Element{
    const isAuthenticated = localStorage.getItem("token") ? true : false; 
    const step = localStorage.getItem("STEP")
    
    if(step){
        if(JSON.parse(step) == 'question' || JSON.parse(step) == 'pack'){
            return children
        }
    }

    if (isAuthenticated) {
       return <Navigate to="/" />
    }
      
    return children
}