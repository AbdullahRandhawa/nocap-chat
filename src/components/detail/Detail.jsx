import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css"

const Detail = ({ setMobileView }) => {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore()

    const { currentUser } = useUserStore()

    const handleBlock = async () => {
        if (!user || isCurrentUserBlocked) return

        const userDocRef = doc(db, "users", currentUser.id)

        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            })
            changeBlock()
        }
        catch (err) {
            console.log(err)
        }

    }
    return (
        <div className="detail">
            {/* Header with Mobile Back Button - hidden on desktop via CSS */}
            <div className="detailHeader">
                <button className="mobileBackButton" onClick={() => setMobileView && setMobileView("chat")}>
                    ← Back
                </button>
            </div>

            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2> {user?.username} </h2>
                <p style={{
                    fontSize: "14px",
                    color: "#a5a5a5",
                    margin: "5px 0 10px 0",
                    fontStyle: "italic",
                    textAlign: "center"
                }}>
                    {user?.bio || "No bio available"}
                </p>
            </div>

            <div className="info">
                <div className="buttons">
                    <button onClick={handleBlock} disabled={isCurrentUserBlocked}>
                        {isCurrentUserBlocked ? "You Are Blocked" : isReceiverBlocked ? "User Blocked " : "Block User"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Detail;