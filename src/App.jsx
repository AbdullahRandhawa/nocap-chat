import Login from "./components/login/Login"
import List from "./components/list/List"
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import Notification from "./components/notification/Notification"
import "./app.css"
import { useEffect, useState, useRef } from "react"
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth" // Added signInWithCustomToken
import { auth } from "./lib/firebase"
import { useUserStore } from "./lib/userStore"
import { useChatStore } from "./lib/chatStore"
import Cookies from "js-cookie" // Added this to read the cookie
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";
import { toast } from "react-toastify";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore()
  const { chatId, changeChat } = useChatStore()

  const containerRef = useRef(null)

  // 1. SILENT LOGIN SENSOR (New Logic)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('fbToken');
    const cookieToken = Cookies.get('fbToken');
    const token = urlToken || cookieToken;

    // If we have a token from LocaStay but Firebase hasn't logged us in yet
    if (token && !auth.currentUser) {
      console.log("LocaStay token found! Authenticating...");
      signInWithCustomToken(auth, token).catch((err) => {
        console.error("Auto-login failed:", err.message);
        Cookies.remove('fbToken'); // Wipe bad token
      });
    }
  }, []); // Run once on mount

  // 2. AUTH STATE LISTENER (Your existing logic)
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      await fetchUserInfo(user ? user.uid : null);
      console.log("Firebase UID:", user?.uid)
    })

    return () => {
      unSub()
    }
  }, [fetchUserInfo])

  // 3. STATE-BASED MOBILE TOGGLE
  const [mobileView, setMobileView] = useState("list"); // "list", "chat", "detail"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  console.log("Current Store User:", currentUser)

  useEffect(() => {
    const checkUrlForReceiver = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const receiverId = searchParams.get("receiverId");

      // Only run if we have a receiverId, a logged-in user, and it's not ourselves
      if (receiverId && currentUser && currentUser.id !== receiverId) {
        try {
          // 1. Check if a chat with this owner already exists in your list
          const userChatsRef = doc(db, "userchats", currentUser.id);
          const userChatsSnap = await getDoc(userChatsRef);

          if (userChatsSnap.exists()) {
            const chats = userChatsSnap.data().chats || [];
            const existingChat = chats.find(c => c.receiverId === receiverId);

            if (existingChat) {
              // If it exists, just open the chat window
              changeChat(existingChat.chatId, { id: receiverId });
              setMobileView("chat"); // Auto-open chat view on mobile
            } else {
              // 2. CHECK IF USER EXISTS before trying to add
              const receiverSnap = await getDoc(doc(db, "users", receiverId));

              if (!receiverSnap.exists()) {
                console.log("Receiver does not exist in Firestore!");
                // --- ADDED POPUP MESSAGE ---
                toast.error("User not found! They might have been deleted.");

                // Clean the URL so the error doesn't repeat on refresh
                window.history.replaceState(null, "", window.location.pathname);
                return; // Stop the logic here
              }

              // 3. If user exists, create the chat (using your handleAdd logic)
              const newChatRef = doc(collection(db, "chats"));
              await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
              });

              const chatData = {
                chatId: newChatRef.id,
                lastMessage: "",
                updatedAt: Date.now(),
              };

              // Update the Owner's chat list
              await updateDoc(doc(db, "userchats", receiverId), {
                chats: arrayUnion({ ...chatData, receiverId: currentUser.id })
              });

              // Update your (the current user's) chat list
              await updateDoc(doc(db, "userchats", currentUser.id), {
                chats: arrayUnion({ ...chatData, receiverId: receiverId })
              });

              // Open the newly created chat
              changeChat(newChatRef.id, receiverSnap.data());
              setMobileView("chat"); // Auto-open chat view on mobile
            }
          }

          // 4. Clean the URL so it doesn't try to add them again on refresh
          window.history.replaceState(null, "", window.location.pathname);
        } catch (err) {
          console.error("Auto-chat failed:", err);
          toast.error("Something went wrong opening the chat.");
        }
      }
    };

    if (!isLoading && currentUser) {
      checkUrlForReceiver();
    }
  }, [currentUser, isLoading, changeChat]);

  if (isLoading) return <div className="loading">Loading...</div>

  return (
    <div className={`container ${chatId ? 'chat-active' : ''}`}>
      {currentUser ? (
        <>
          {(!isMobile && !isTablet) && (
            <>
              <List setMobileView={setMobileView} />
              <Chat setMobileView={setMobileView} showBackButton={false} showInfoButton={false} />
              <Detail setMobileView={setMobileView} />
            </>
          )}

          {isTablet && (
            <>
              {mobileView !== "detail" && <List setMobileView={setMobileView} />}
              <Chat 
                setMobileView={setMobileView} 
                showBackButton={mobileView === "detail"} 
                showInfoButton={mobileView !== "detail"} 
              />
              {mobileView === "detail" && <Detail setMobileView={setMobileView} />}
            </>
          )}

          {isMobile && (
            <>
              {mobileView === "list" && <List setMobileView={setMobileView} />}
              {mobileView === "chat" && <Chat setMobileView={setMobileView} showBackButton={true} showInfoButton={true} />}
              {mobileView === "detail" && <Detail setMobileView={setMobileView} />}
            </>
          )}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App