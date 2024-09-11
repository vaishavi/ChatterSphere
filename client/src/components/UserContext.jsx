import { useContext, useState, createContext,useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({})

export function UserContextProvider({children}){
    const [userName, setUserName]= useState(null);
    const [id, setId] = useState(null);
    useEffect(() => {
        axios.get("/profile").then(res =>{
            setId(res.data.userId),
            setUserName(res.data.username)}
        ).catch((err)=> {
            if (err) throw err;
        })
    },[])
    return(
    <UserContext.Provider value={{userName,setUserName,id,setId}}>{children}</UserContext.Provider> )
};
