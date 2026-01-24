import { useEffect, useState, useRef } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore"
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/cloudinary"

const Chat = () => {

    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")
    const [attachment, setAttachment] = useState({
        file: null,
        url: "",
        type: "" // "image" or "file"
    });

    const { currentUser } = useUserStore()
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore()

    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat?.messages])

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "chats", chatId),
            (res) => {
                setChat(res.data())
            }
        )
        return () => {
            unSub()
        }
    }, [chatId])

    const handleEmoji = (e) => {
        setText((prev) => prev + e.emoji)
    }

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            const isImg = selected.type.startsWith("image/");
            setAttachment({
                file: selected,
                url: isImg ? URL.createObjectURL(selected) : "",
                type: isImg ? "image" : "file",
                name: selected.name
            });
        }
    };
    const handleSend = async () => {
        // Check if both text and the file are empty. If so, do nothing.
        if (text === "" && !attachment.file) return;

        let fileUrl = null;

        try {
            if (attachment.file) {
                // This 'upload' function better handle resource_type: "auto" 
                // or Cloudinary is going to reject your PDFs.
                fileUrl = await upload(attachment.file);
            }

            const newMessage = {
                senderId: currentUser.id,
                text,
                createdAt: new Date(),
                // Only add these fields if a file actually exists
                ...(fileUrl && {
                    fileUrl,
                    fileType: attachment.type, // "image" or "file"
                    fileName: attachment.name
                }),
            };

            // 1. Update the actual chat document
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion(newMessage)
            });

            const userIds = [currentUser.id, user.id];

            // 2. Update the sidebar/chat list for both users
            for (const id of userIds) {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex(
                        (c) => c.chatId === chatId
                    );

                    if (chatIndex !== -1) {
                        // Logic for the 'Last Message' preview text
                        let lastMsgText = text;
                        if (!text && attachment.file) {
                            lastMsgText = attachment.type === "image" ? "📷 Image" : `📁 ${attachment.name}`;
                        }

                        userChatsData.chats[chatIndex].lastMessage = lastMsgText;
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();

                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });
                    }
                }
            }

            // 3. Reset the state so the user can send more trash
            setAttachment({
                file: null,
                url: "",
                type: "",
                name: ""
            });

            setText("");

        } catch (err) {
            console.error("Failed to send message. You probably broke the Cloudinary config:", err);
        }
    };


    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span> {user?.username} </span>
                        {/* <p>Bla Blalalalalalal bla</p> */}
                    </div>
                </div>
                {/* <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div> */}
            </div>


            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                        <div className="texts">
                            {message.fileUrl && (
                                message.fileType === "image" ? (
                                    <img src={message.fileUrl} alt="" />
                                ) : (
                                    <a href={message.fileUrl} target="_blank" rel="noreferrer" className="message fileAttachment">
                                        <span style={{
                                            display: "flex",
                                            backgroundColor: "white",
                                            padding: "10px 20px",

                                            borderRadius: "10px",
                                            fontSize: "14px",
                                            color: "black",
                                            textDecorationColor: "white"
                                        }}>{message.fileName || "Download File"}</span>
                                    </a>
                                )
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file" title="Share files and pictures">
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleFile} />
                    {/* <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" /> */}
                </div>
                <input type="text" placeholder="Type a Message..." value={text} onChange={(e) => setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked} />
                <div className="emoji">
                    <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} style={{ width: '250px', height: '350px' }} />
                    </div>

                </div>
                {attachment.file && (
                    <div className="imagePreview">
                        {attachment.type === "image" ? (
                            <img src={attachment.url} alt="preview" />
                        ) : (

                            <img src="./file-solid-full.svg" alt="file"></img>

                        )}
                        <button className="removeImg" onClick={() => setAttachment({ file: null, url: "", type: "" })}>✕</button>
                    </div>
                )}
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div >
    )
}

export default Chat;