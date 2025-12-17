import Login from "./components/login/Login"
import List from "./components/list/List"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import Notification from "./components/notification/Notification"
import "./app.css"

const App = () => {
  const user = true

  return (
    <div className='container'>

      {user ? (<>
        <List />
        <Chat />
        <Detail />
      </>) : (<Login />)}
      <Notification />
    </div>
  )
}

export default App