import axios from "axios"
import Register from "./components/RegisterOrLogin"
import { UserContextProvider } from "./components/UserContext"
import Routes from "./components/Routes"

function App() {
 if (process.env.NODE_ENV === 'development') {
    axios.defaults.baseURL = "http://localhost:4000";
  } else {
    axios.defaults.baseURL = "https://your-glitch-project-url.glitch.me";
  }
  axios.defaults.withCredentials = true
  return (
    <>
    <UserContextProvider><Routes></Routes></UserContextProvider>    
    </>
  )
}

export default App
