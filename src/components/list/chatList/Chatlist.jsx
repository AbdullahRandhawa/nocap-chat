import { useState } from "react"
import "./chatList.css"
import AddUser from "./addUser/AddUser"

const Chatlist = () => {
    const [addMode, setAddMode] = useState(false)
    return (
        <div className="chatList">

            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder="search..." />
                </div>
                <div className="add">
                    <img src={addMode ? "./minus.png" : "./plus.png"} alt=""
                        onClick={() => setAddMode(prev => !prev)}
                    />
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Hamza Faheem</span>
                    <p>Hello! How r u?</p>
                </div>
            </div>

            {addMode && <AddUser />}

        </div>
    )
}

export default Chatlist