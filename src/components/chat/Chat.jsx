import { useEffect, useState, useRef } from "react"
import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useChatStore } from "../../lib/chatStore"
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/cloudinary"

const Chat = ({ setMobileView }) => {

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
    const textareaRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat?.messages])

    // Auto-grow textarea like WhatsApp
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
        }
    }, [text])

    useEffect(() => {
        if (!chatId) return;

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


    if (!chatId) {
        return (
            <div className="chat" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Select a chat to start messaging.</p>
            </div>
        );
    }

    return (
        <div className="chat">
            <div className="top">
                {/* Back button on the far left — mobile only */}
                <button className="mobileBackButton" onClick={() => setMobileView && setMobileView("list")}>
                    ←
                </button>

                {/* User info in the center */}
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                    </div>
                </div>

                {/* Info button on the far right — mobile only */}
                <button className="mobileInfoButton" onClick={() => setMobileView && setMobileView("detail")}>
                    ⋮
                </button>
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
                <textarea
                    ref={textareaRef}
                    className="messageInput"
                    placeholder="Type a Message..."
                    value={text}
                    rows={1}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <div className="emojiToggleIcon" onClick={() => setOpen((prev) => !prev)}>🙂</div>
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} theme="dark" style={{ width: '250px', height: '350px' }} />
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
        </div>
    )
}

export default Chat;