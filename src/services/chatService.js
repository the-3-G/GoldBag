// src/services/chatService.js
import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    increment
} from "firebase/firestore";

const chatDocId = (userId, agentId) => `${userId}_${agentId}`;

/**
 * Get or create a chat between a user and their agent
 */
export const getOrCreateChat = async (userId, agentId) => {
    const id = chatDocId(userId, agentId);
    const chatRef = doc(db, "chats", id);

    const newChat = {
        userId,
        agentId,
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: {
            user: 0,
            agent: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    try {
        const existing = await getDoc(chatRef);
        if (existing.exists()) {
            return { id, ...existing.data() };
        }
    } catch (error) {
        // If get fails, still try create (rules may allow create but not null-resource get until deployed)
        if (error.code !== "permission-denied") {
            console.error("Error reading chat:", error);
            throw error;
        }
    }

    try {
        await setDoc(chatRef, newChat);
        return { id, ...newChat };
    } catch (error) {
        if (error.code === "permission-denied") {
            const existing = await getDoc(chatRef);
            if (existing.exists()) {
                return { id, ...existing.data() };
            }
        }
        console.error("Error getting/creating chat:", error);
        throw error;
    }
};

/**
 * Send a message in a chat
 */
export const sendMessage = async (chatId, senderId, senderRole, text, imageUrl = null) => {
    try {
        // Add message to subcollection
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messageData = {
            senderId,
            senderRole,
            createdAt: serverTimestamp(),
            read: false
        };

        if (text) messageData.text = text;
        if (imageUrl) messageData.imageUrl = imageUrl;

        await addDoc(messagesRef, messageData);

        // Update chat metadata
        const chatRef = doc(db, "chats", chatId);
        const updateData = {
            lastMessage: text ? text : (imageUrl ? "📷 Photo" : ""),
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Increment unread count for the receiver
        if (senderRole === "user") {
            updateData["unreadCount.agent"] = increment(1);
        } else {
            updateData["unreadCount.user"] = increment(1);
        }

        await updateDoc(chatRef, updateData);

        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};


/**
 * Get messages for a chat (real-time listener)
 */
export const subscribeToMessages = (chatId, callback) => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));
        callback(messages);
    });
};

/**
 * Get user's chat with their agent or support admin
 * For users with a referred agent, the chat is tied to that agent.
 * For users without a referred agent, the chat uses "admin_support" as agentId
 * so that ALL admins can see and reply to it.
 */
export const getUserChat = async (userId) => {
    try {
        console.log("📞 getUserChat called for userId:", userId);

        // 1. Check if user already has an active chat in chats collection
        const existingChatsQuery = query(
            collection(db, "chats"),
            where("userId", "==", userId)
        );
        const existingChatsSnapshot = await getDocs(existingChatsQuery);

        if (!existingChatsSnapshot.empty) {
            const existingChats = existingChatsSnapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));

            // Sort by most recent activity
            existingChats.sort((a, b) => {
                const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate() : (a.lastMessageTime?.seconds ? new Date(a.lastMessageTime.seconds * 1000) : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)));
                const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate() : (b.lastMessageTime?.seconds ? new Date(b.lastMessageTime.seconds * 1000) : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)));
                return timeB - timeA;
            });

            console.log("✅ Found existing chat for user:", existingChats[0]);
            return existingChats[0];
        }

        // 2. If no existing chat, check user doc for referred agent or resolve admin
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const userData = userDoc.data();
        let targetAgentId = userData.referredBy;

        // If no specific agent, use shared admin_support so ALL admins see the chat
        if (!targetAgentId) {
            targetAgentId = "admin_support";
        }

        // Get or create the chat between user and admin/agent
        console.log("✅ Getting or creating chat between user and support/admin:", targetAgentId);
        const chat = await getOrCreateChat(userId, targetAgentId);
        console.log("Chat result:", chat);
        return chat;
    } catch (error) {
        console.error("❌ Error in getUserChat:", error);
        console.error("Error code:", error ? error.code : "unknown");
        throw error;
    }
};

/**
 * Get all chats for an agent or admin.
 * Admins see ALL chats (including admin_support and agent-specific chats).
 * Agents only see chats where agentId matches their own ID.
 */
export const getAgentChats = async (agentId, isAdmin = false) => {
    try {
        const chatsRef = collection(db, "chats");
        const q = isAdmin
            ? query(chatsRef)
            : query(chatsRef, where("agentId", "==", agentId));

        const snapshot = await getDocs(q);
        const chats = [];

        for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            let userData = {};

            // Get user details safely
            try {
                if (chatData.userId) {
                    const userDoc = await getDoc(doc(db, "users", chatData.userId));
                    userData = userDoc.exists() ? userDoc.data() : {};
                }
            } catch (err) {
                console.error(`Error fetching user profile for chat ${chatDoc.id}:`, err);
            }

            chats.push({
                id: chatDoc.id,
                ...chatData,
                userName: userData.name || userData.email?.split("@")[0] || "Unknown User",
                userEmail: userData.email,
                lastMessageTime: chatData.lastMessageTime?.toDate ? chatData.lastMessageTime.toDate() : (chatData.lastMessageTime?.seconds ? new Date(chatData.lastMessageTime.seconds * 1000) : null)
            });
        }

        // Sort in memory
        return chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    } catch (error) {
        console.error("Error getting agent chats:", error);
        throw error;
    }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (chatId, userRole) => {
    try {
        const chatRef = doc(db, "chats", chatId);
        const updateData = {};

        if (userRole === "user") {
            updateData["unreadCount.user"] = 0;
        } else {
            updateData["unreadCount.agent"] = 0;
        }

        await updateDoc(chatRef, updateData);

        return { success: true };
    } catch (error) {
        console.error("Error marking as read:", error);
        throw error;
    }
};

/**
 * Delete a message from a chat
 */
export const deleteMessage = async (chatId, messageId) => {
    try {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await deleteDoc(messageRef);

        // Update the chat's lastMessage to reflect the new most recent message
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const chatRef = doc(db, "chats", chatId);

        if (snapshot.empty) {
            // No messages left
            await updateDoc(chatRef, {
                lastMessage: "",
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } else {
            // Update to the new latest message
            const latestMsg = snapshot.docs[0].data();
            await updateDoc(chatRef, {
                lastMessage: latestMsg.text || (latestMsg.imageUrl ? "📷 Photo" : ""),
                lastMessageTime: latestMsg.createdAt || serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
};

/**
 * Subscribe to chat updates (for real-time chat list).
 * Admins see ALL chats. Agents only see their own.
 */
export const subscribeToAgentChats = (agentId, callback, isAdmin = false) => {
    const chatsRef = collection(db, "chats");
    const q = isAdmin
        ? query(chatsRef)
        : query(chatsRef, where("agentId", "==", agentId));

    return onSnapshot(q, async (snapshot) => {
        const chats = [];
        for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();

            let userData = {};

            // Get user details safely
            try {
                if (chatData.userId) {
                    const userDoc = await getDoc(doc(db, "users", chatData.userId));
                    userData = userDoc.exists() ? userDoc.data() : {};
                }
            } catch (err) {
                console.error("Error fetching user for chat:", err);
            }

            chats.push({
                id: chatDoc.id,
                ...chatData,
                userName: userData.name || userData.email?.split("@")[0] || "Unknown User",
                userEmail: userData.email,
                isSharedAdminChat: chatData.agentId === "admin_support",
                lastMessageTime: chatData.lastMessageTime?.toDate ? chatData.lastMessageTime.toDate() : (chatData.lastMessageTime?.seconds ? new Date(chatData.lastMessageTime.seconds * 1000) : null)
            });
        }

        // Sort in memory
        chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));

        callback(chats);
    }, (error) => {
        console.error("Error subscribing to agent chats:", error);
        if (callback.onError) callback.onError(error);
    });
};

/**
 * Initiate a chat from agent side with a referred user or any user (for admin).
 * Admins always create shared "admin_support" chats so all admins can see them.
 * Agents create chats tied to their own ID.
 */
export const initiateAgentChat = async (agentId, userId) => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }

        const userData = userDoc.data();
        
        // Skip referral validation if the initiator is an administrator
        const agentDoc = await getDoc(doc(db, "users", agentId));
        const agentData = agentDoc.exists() ? agentDoc.data() : {};
        const isInitiatorAdmin = agentData.role === "admin" || agentData.email?.toLowerCase() === "baggold57@gmail.com";

        if (!isInitiatorAdmin && userData.referredBy !== agentId) {
            throw new Error("You can only chat with users you referred");
        }

        // For admins, use shared "admin_support" so all admins can see the chat
        const chatAgentId = isInitiatorAdmin ? "admin_support" : agentId;
        const chat = await getOrCreateChat(userId, chatAgentId);
        const displayName = userData.name || userData.email?.split("@")[0] || "User";

        return {
            ...chat,
            userName: displayName,
            userEmail: userData.email,
        };
    } catch (error) {
        console.error("Error initiating agent chat:", error);
        throw error;
    }
};

/**
 * Migrate existing admin-specific chats to the shared "admin_support" format.
 * This should be called once by an admin to convert old chats.
 * After migration, all admins will see chats that were previously tied to one specific admin.
 */
export const migrateAdminChatsToShared = async () => {
    try {
        // Find all admin users
        const adminQuery = query(
            collection(db, "users"),
            where("role", "==", "admin")
        );
        const adminSnapshot = await getDocs(adminQuery);
        const adminIds = adminSnapshot.docs.map(d => d.id);

        if (adminIds.length === 0) {
            console.log("No admin users found, nothing to migrate");
            return { migrated: 0 };
        }

        // Find chats where agentId is one of the admin UIDs (old format)
        const chatsRef = collection(db, "chats");
        const allChatsSnapshot = await getDocs(chatsRef);
        let migrated = 0;

        for (const chatDoc of allChatsSnapshot.docs) {
            const chatData = chatDoc.data();
            
            // Skip if already using shared format or if it's an agent chat
            if (chatData.agentId === "admin_support" || !adminIds.includes(chatData.agentId)) {
                continue;
            }

            const userId = chatData.userId;
            const newChatId = chatDocId(userId, "admin_support");
            const newChatRef = doc(db, "chats", newChatId);

            // Check if the new shared chat already exists
            const existingNew = await getDoc(newChatRef);
            if (existingNew.exists()) {
                console.log(`Shared chat already exists for user ${userId}, skipping`);
                continue;
            }

            // Create the new shared chat doc
            await setDoc(newChatRef, {
                ...chatData,
                agentId: "admin_support",
                updatedAt: serverTimestamp()
            });

            // Copy all messages from old chat to new chat
            const oldMessagesRef = collection(db, "chats", chatDoc.id, "messages");
            const messagesSnapshot = await getDocs(query(oldMessagesRef, orderBy("createdAt", "asc")));
            
            for (const msgDoc of messagesSnapshot.docs) {
                const newMsgRef = doc(collection(db, "chats", newChatId, "messages"), msgDoc.id);
                await setDoc(newMsgRef, msgDoc.data());
            }

            console.log(`✅ Migrated chat ${chatDoc.id} → ${newChatId} (${messagesSnapshot.docs.length} messages)`);
            migrated++;
        }

        console.log(`Migration complete: ${migrated} chats migrated`);
        return { migrated };
    } catch (error) {
        console.error("Error migrating admin chats:", error);
        throw error;
    }
};
