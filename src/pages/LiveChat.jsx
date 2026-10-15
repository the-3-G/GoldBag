// src/pages/LiveChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserChat, sendMessage, subscribeToMessages, markAsRead } from "../services/chatService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import "./LiveChat.css";

export default function LiveChat() {
    console.log("🔵 LiveChat component rendered");

    const { user: currentUser } = useAuth();
    console.log("🔵 Current user:", currentUser);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [chat, setChat] = useState(null);
    const [agentInfo, setAgentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const messagesEndRef = useRef(null);
    const unsubscribeRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImageSelection = () => {
        setSelectedImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log("🔵 useEffect triggered, currentUser:", currentUser);
        if (!currentUser) {
            console.log("⚠️ No current user, exiting useEffect");
            return;
        }

        const initializeChat = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get user's chat
                const userChat = await getUserChat(currentUser.uid);

                if (!userChat) {
                    setError("no_agent");
                    setLoading(false);
                    return;
                }

                setChat(userChat);

                // Get agent info — for shared admin chats, show generic support info
                if (userChat.agentId === "admin_support") {
                    setAgentInfo({
                        id: "admin_support",
                        role: "admin",
                        name: "Support Desk",
                        email: "support"
                    });
                } else {
                    const agentDoc = await getDoc(doc(db, "users", userChat.agentId));
                    if (agentDoc.exists()) {
                        setAgentInfo({
                            id: agentDoc.id,
                            ...agentDoc.data()
                        });
                    }
                }

                // Subscribe to messages
                unsubscribeRef.current = subscribeToMessages(userChat.id, (msgs) => {
                    setMessages(msgs);
                });

                // Mark messages as read
                await markAsRead(userChat.id, "user");

                setLoading(false);
            } catch (err) {
                console.error("❌ Error initializing chat:", err);
                console.error("Error code:", err.code);
                console.error("Error message:", err.message);

                // Check if it's a permission error
                if (err.code === 'permission-denied') {
                    console.error("🔒 PERMISSION DENIED - Firestore security rules need to be updated!");
                    alert("Chat Error: Permission denied. Please update Firestore security rules.");
                }

                setError("error");
                setLoading(false);
            }
        };

        initializeChat();

        // Cleanup
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [currentUser]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() && !selectedImage) return;
        if (!chat) return;

        try {
            setUploadingImage(true);
            let imageUrl = null;
            if (selectedImage) {
                imageUrl = await uploadImageToCloudinary(selectedImage);
            }
            await sendMessage(chat.id, currentUser.uid, "user", inputText, imageUrl);
            setInputText("");
            clearImageSelection();
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="live-chat-page">
                <div className="chat-container glass-card">
                    <div className="chat-loading">
                        <div className="spinner"></div>
                        <p>Loading chat...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error === "no_agent") {
        return (
            <div className="live-chat-page">
                <div className="chat-container glass-card">
                    <div className="chat-error">
                        <div className="error-icon">👤</div>
                        <h2>No Agent Assigned</h2>
                        <p>You don't have an agent assigned yet.</p>
                        <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
                            Please contact the administrator to assign you an agent.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error === "error") {
        return (
            <div className="live-chat-page">
                <div className="chat-container glass-card">
                    <div className="chat-error">
                        <div className="error-icon">⚠️</div>
                        <h2>Error Loading Chat</h2>
                        <p>Something went wrong. Please try refreshing the page.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="live-chat-page">
            <div className="chat-container glass-card">
                <div className="chat-header">
                    <div className="agent-avatar">
                        <div className="avatar-img">👩‍💼</div>
                        <div className="online-status"></div>
                    </div>
                    <div className="header-info">
                        <h2>{agentInfo?.role === 'admin' ? "Support Desk" : (agentInfo?.name || agentInfo?.email || "Your Agent")}</h2>
                        <span className="status-text">Online • {agentInfo?.role === 'admin' ? "Customer Support" : "Your assigned agent"}</span>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <div className="empty-icon">💬</div>
                            <p>No messages yet</p>
                            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                                {agentInfo?.role === 'admin' ? "Start a conversation with Customer Support" : "Start a conversation with your agent"}
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.senderRole}`}>
                                <div className="message-bubble">
                                    {msg.imageUrl && (
                                        <div className="message-image-container">
                                            <img
                                                src={msg.imageUrl}
                                                alt="Uploaded content"
                                                className="message-image"
                                                onClick={() => window.open(msg.imageUrl, '_blank')}
                                            />
                                        </div>
                                    )}
                                    {msg.text && <div className="message-text">{msg.text}</div>}
                                </div>
                                <div className="message-time">
                                    {msg.createdAt ? msg.createdAt.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : ''}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {imagePreview && (
                    <div className="chat-image-preview-container">
                        <img src={imagePreview} alt="Preview" className="chat-image-preview" />
                        <button type="button" className="remove-preview-btn" onClick={clearImageSelection}>✕</button>
                        {uploadingImage && (
                            <div className="preview-uploading-overlay">
                                <div className="spinner-small"></div>
                            </div>
                        )}
                    </div>
                )}

                <form className="chat-input-area" onSubmit={handleSend}>
                    <label className="attach-btn" htmlFor="chat-image-input">
                        📷
                    </label>
                    <input
                        id="chat-image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                        disabled={uploadingImage}
                    />
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={uploadingImage ? "Uploading image..." : "Type your message..."}
                        className="chat-input"
                        disabled={uploadingImage}
                    />
                    <button 
                        type="submit" 
                        className="send-btn" 
                        disabled={uploadingImage || (!inputText.trim() && !selectedImage)}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
