import { useContext } from "react"
import Register from "./RegisterOrLogin"
import { UserContext } from "./UserContext"
import Chat from "./Chat"

const Routes = () => {
    const {userName,id} = useContext(UserContext)
    if (userName){
        return <Chat></Chat>
    }
  return (
    <Register></Register>
  )
}

export default Routes