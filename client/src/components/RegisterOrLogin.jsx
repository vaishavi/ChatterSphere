import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

const RegisterOrLogin = () => {

  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const {setUserName,setId} = useContext(UserContext)
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login')

  const register = async(ev) =>{
    ev.preventDefault();
    const url = isLoginOrRegister === 'register'? 'register': 'login'
    const {data}= await axios.post("/"+url,{username,password})
    setUserName(username)
    setId(data.id)  

  }


    return(
      <>
      <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={register}>
        <input value = {username} 
        onChange={ev => setUsername(ev.target.value)} type="text" placeholder="username" className="block w-full rounded-sm p-2 mb-2 border "></input>
        <input value= {password} 
        onChange= {ev => setPassword(ev.target.value)}type="password" placeholder="password" className="block w-full rounded-sm p-2 mb-2 border"></input>
        <button className="block bg-blue-500 text-white w-full rounded-sm p-2 ">{isLoginOrRegister === 'register'? 'Register': 'Login'}</button>
        {isLoginOrRegister === 'register' && <div className="text-center mt-2">
          Already a member? 
          <button className="ml-2" onClick={() => setIsLoginOrRegister('login')}>Login here</button>
        </div>}
        {isLoginOrRegister === 'login' && <div className="text-center mt-2">
          Not a member yet? 
          <button className="ml-2" onClick={() => setIsLoginOrRegister('register')}>Register here</button>
        </div>}
      </form>
      
    </div>
    
    </>
    
    );
    

}

export default RegisterOrLogin;