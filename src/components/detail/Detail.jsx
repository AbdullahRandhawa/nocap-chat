import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css"

const Detail = () => {
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
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2> {user?.username} </h2>
                {/* <p>etur adipisicing elit. Doloremq</p> */}
            </div>

            <div className="info">
                {/* 
                <div className="option">
                    <div className="title">
                        <span>Sharred Photos</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                </div>
                <div className="photos">
                    <div className="photoItem">
                        <div className="photoDetail">
                            <img src="https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=" alt="" />
                            <span>football-stats.jpg</span>
                        </div>
                        <img src="./download.png" alt="" className="icon" />
                    </div>
                    <div className="photoItem">
                        <div className="photoDetail">
                            <img src="https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=" alt="" />
                            <span>football-stats.jpg</span>
                        </div>
                        <img src="./download.png" alt="" className="icon" />
                    </div>
                    <div className="photoItem">
                        <div className="photoDetail">
                            <img src="https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=" alt="" />
                            <span>football-stats.jpg</span>
                        </div>
                        <img src="./download.png" alt="" className="icon" />
                    </div>
                    <div className="photoItem">
                        <div className="photoDetail">
                            <img src="https://media.istockphoto.com/id/1146517111/photo/taj-mahal-mausoleum-in-agra.jpg?s=612x612&w=0&k=20&c=vcIjhwUrNyjoKbGbAQ5sOcEzDUgOfCsm9ySmJ8gNeRk=" alt="" />
                            <span>football-stats.jpg</span>
                        </div>
                        <img src="./download.png" alt="" className="icon" />
                    </div>

                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div> */}
                <div className="buttons">
                    <button onClick={handleBlock} disabled={isCurrentUserBlocked}> {
                        isCurrentUserBlocked ? "You Are Blocked" : isReceiverBlocked ? "User Blocked " : "Block User"
                    } </button>
                    <button className="logout" onClick={() => auth.signOut()}>Log Out</button>
                </div>
            </div>
        </div>
    )
}

export default Detail;