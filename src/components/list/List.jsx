import Chatlist from "./chatList/ChatList";
import "./list.css"
import Userinfo from "./userInfo/Userinfo";

const List = ({ setMobileView }) => {
    return (
        <div className="list">
            <Userinfo />
            <Chatlist setMobileView={setMobileView} />
        </div>
    )
}

export default List;