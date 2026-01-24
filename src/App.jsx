import Login from "./components/login/Login"
import List from "./components/list/List"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import Notification from "./components/notification/Notification"
import "./app.css"
import { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import { useChatStore } from "./lib/chatStore"

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore()
  const { chatId } = useChatStore()

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      await fetchUserInfo(user ? user.uid : null);
      console.log(user?.uid)
    })

    return () => {
      unSub()
    }

  }, [fetchUserInfo])

  console.log(currentUser)

  if (isLoading) return <div className="loading">Loading...</div>

  return (
    <div className='container'>

      {currentUser ? (<>
        <List />
        {chatId && <Chat />}
        <Detail />
      </>) : (<Login />)}
      <Notification />
    </div>
  )
}

export default App