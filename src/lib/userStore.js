import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";


export const useUserStore = create((set) => ({
    currentUser: null,
    isLoading: true,

    fetchUserInfo: async (uid) => {
        console.log("fetchUserInfo called with uid:", uid);

        if (!uid) return set({
            currentUser: null,
            isLoading: false,
        })

        try {
            const docRef = doc(db, "users", uid)
            console.log("Fetching from path: users/", uid);

            const docSnap = await getDoc(docRef)
            console.log("Document exists:", docSnap.exists());
            console.log("Document data:", docSnap.data());

            if (docSnap.exists()) {
                set({
                    currentUser: docSnap.data(),
                    isLoading: false,
                })
                console.log("User set successfully");
            } else {
                console.log("Document does not exist!");
                set({
                    currentUser: null,
                    isLoading: false,
                })
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            return set({
                currentUser: null,
                isLoading: false,
            })
        }
    }

}))