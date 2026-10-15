import { db } from "../firebase";
import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";

/**
 * Creates an in-app notification if the user's preferences allow it.
 * 
 * @param {string} uid - The user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @param {string} type - The type of notification (e.g. 'deposit', 'withdrawal', 'trade', 'system')
 */
export const createNotification = async (uid, title, message, type = 'system') => {
    try {
        // 1. Fetch user's notification preferences
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        
        let shouldNotify = true;
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Check specific preferences based on type
            if (type === 'deposit' || type === 'withdrawal') {
                shouldNotify = userData.depositNotifications !== false;
            } else if (type === 'trade') {
                shouldNotify = userData.tradeNotifications !== false;
            }
        }
        
        // 2. Create the notification if allowed
        if (shouldNotify) {
            await addDoc(collection(db, "notifications"), {
                userId: uid,
                title,
                message,
                type,
                read: false,
                createdAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
