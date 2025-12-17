import { useEffect, useState, useRef } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"

const Chat = () => {

    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji)
    }

    console.log(text);

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Abdulrehman</span>
                        <p>Bla Blalalalalalal bla</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>


            <div className="center">
                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia ipsam ipsum, magnam officiis illum aspernatur qui soluta deserunt provident, alias adipisci voluptates hic reprehenderit similique pariatur sit sapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>

                <div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia ipsam ipsum, magnam officiis illum aspernatur qui soluta deserunt provident, alias adipisci voluptates hic reprehenderit similique pariatur sit sapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>
                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia ipsam ipsum, magnam officiis illum aspernatur qui soluta deserunt provident, alias adipisci voluptates hic reprehenderit similique pariatur sit sapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>

                <div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia ipsam ipsum, magnam officiis illum aspernatur qui soluta deserunt provident, alias adipisci voluptates hic reprehenderit similique pariatur sit sapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>
                <div className="message">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Mollitia ipsam ipsum, magnam officiis illum aspernatur qui soluta deserunt provident, alias adipisci voluptates hic reprehenderit similique pariatur sit sapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>

                <div className="message own">
                    <div className="texts">
                        <img src="https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                        <p> voluptates hic reprehenderit simapiente exercitationem illo.</p>
                        <span>! min ago</span>
                    </div>
                </div>

                <div ref={endRef}></div>
            </div>


            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="" />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input type="text" placeholder="Type a Message..." value={text} onChange={(e) => setText(e.target.value)} />
                <div className="emoji">
                    <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} style={{ width: '250px', height: '350px' }} />
                    </div>

                </div>
                <button className="sendButton">Send</button>
            </div>
        </div>
    )
}

export default Chat; 