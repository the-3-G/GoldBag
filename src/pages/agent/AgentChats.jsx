// src/pages/agent/AgentChats.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToAgentChats, sendMessage, subscribeToMessages, markAsRead, initiateAgentChat, deleteMessage } from "../../services/chatService";
import { getReferredUsers } from "../../services/agentService";
import { getAllUsers } from "../../services/adminService";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import "./AgentChats.css";

export default function AgentChats() {
    console.log("🟢 AgentChats component rendered");

    const location = useLocation();
    const { user: currentUser, isAdmin } = useAuth();
    console.log("🟢 Current user:", currentUser);

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatSearch, setChatSearch] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [referredUsers, setReferredUsers] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [startingChatId, setStartingChatId] = useState(null);
    const [chatError, setChatError] = useState("");
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [deletingMessageId, setDeletingMessageId] = useState(null);

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const messagesEndRef = useRef(null);
    const unsubscribeChatsRef = useRef(null);
    const unsubscribeMessagesRef = useRef(null);

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
        if (!currentUser?.uid) return;

        const handleChatsUpdate = (chatList) => {
            setChats(chatList);
            setLoading(false);
            setChatError("");

            // If a specific userId was passed via navigation, auto-select or initiate chat
            if (location.state?.startChatWithUserId) {
                const targetUserId = location.state.startChatWithUserId;
                const existing = chatList.find(c => c.userId === targetUserId);
                if (existing) {
                    handleSelectChat(existing);
                } else {
                    handleStartChat(targetUserId);
                }
            }
        };

        handleChatsUpdate.onError = (error) => {
            console.error("Error in chat subscription:", error);
            setLoading(false);
            setChatError(error.code === "permission-denied"
                ? "Unable to load chats. Please check your permissions."
                : "Failed to load chats.");
        };

        unsubscribeChatsRef.current = subscribeToAgentChats(currentUser.uid, handleChatsUpdate, isAdmin());

        const timeoutId = setTimeout(() => setLoading(false), 5000);

        return () => {
            clearTimeout(timeoutId);
            unsubscribeChatsRef.current?.();
            unsubscribeMessagesRef.current?.();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.uid, location.state?.startChatWithUserId]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setMobileChatOpen(true);
        clearImageSelection();

        // Unsubscribe from previous messages
        if (unsubscribeMessagesRef.current) {
            unsubscribeMessagesRef.current();
        }

        // Subscribe to new chat's messages
        unsubscribeMessagesRef.current = subscribeToMessages(chat.id, (msgs) => {
            setMessages(msgs);
        });

        // Mark as read
        markAsRead(chat.id, "agent");
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim() && !selectedImage) return;
        if (!selectedChat) return;

        try {
            setUploadingImage(true);
            let imageUrl = null;
            if (selectedImage) {
                imageUrl = await uploadImageToCloudinary(selectedImage);
            }
            await sendMessage(selectedChat.id, currentUser.uid, "agent", inputText, imageUrl);
            setInputText("");
            clearImageSelection();
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!selectedChat || deletingMessageId) return;
        if (!window.confirm("Delete this message?")) return;

        try {
            setDeletingMessageId(msgId);
            await deleteMessage(selectedChat.id, msgId);
        } catch (err) {
            console.error("Error deleting message:", err);
            alert("Failed to delete message.");
        } finally {
            setDeletingMessageId(null);
        }
    };

    const handleOpenNewChat = async () => {
        try {
            setLoadingUsers(true);
            setShowNewChatModal(true);
            const users = isAdmin() ? await getAllUsers() : await getReferredUsers(currentUser.uid);
            setReferredUsers(users);
        } catch (error) {
            console.error("Error loading users:", error);
            alert("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleStartChat = async (userId) => {
        if (startingChatId) return;

        try {
            setStartingChatId(userId);
            const newChat = await initiateAgentChat(currentUser.uid, userId);

            setChats((prev) => {
                if (prev.some((c) => c.id === newChat.id)) return prev;
                return [{ ...newChat, lastMessageTime: new Date() }, ...prev];
            });

            setSelectedChat(newChat);
            setShowNewChatModal(false);
            setUserSearch("");
            setMessages([]);

            if (unsubscribeMessagesRef.current) {
                unsubscribeMessagesRef.current();
            }
            unsubscribeMessagesRef.current = subscribeToMessages(newChat.id, (msgs) => {
                setMessages(msgs);
            });
            await markAsRead(newChat.id, "agent");
        } catch (error) {
            console.error("Error starting chat:", error);
            alert(error.message || "Failed to start chat. Please try again.");
        } finally {
            setStartingChatId(null);
        }
    };

    const filteredUsers = referredUsers.filter(user => {
        const searchTerm = userSearch.toLowerCase();
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
    });

    // Filter chats based on search
    const filteredChats = chats.filter(chat => {
        const searchTerm = chatSearch.toLowerCase();
        const name = (chat.userName || "").toLowerCase();
        const email = (chat.userEmail || "").toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
    });

    if (loading) {
        return (
            <div className="agent-chats-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-chats-page">
            <div className="chats-layout">
                {/* Chat List Sidebar */}
                <div className={`chat-list-sidebar glass-card${mobileChatOpen ? ' mobile-hidden' : ''}`}>
                    <div className="sidebar-header">
                        <div>
                            <h2>My Chats</h2>
                            <span className="chat-count">{chats.length}</span>
                        </div>
                        <button
                            className="new-chat-btn"
                            onClick={handleOpenNewChat}
                            title="Start new chat"
                        >
                            ✉️ New Chat
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="chat-search">
                        <input
                            type="text"
                            placeholder="Search chats by name or email..."
                            value={chatSearch}
                            onChange={(e) => setChatSearch(e.target.value)}
                            className="search-input"
                        />
                        {chatSearch && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setChatSearch("")}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {chatError && (
                        <div className="error-message" style={{ margin: '12px 16px 0' }}>{chatError}</div>
                    )}

                    <div className="chat-list">
                        {filteredChats.length === 0 ? (
                            <div className="empty-list">
                                <div className="empty-icon">💬</div>
                                {chatSearch ? (
                                    <>
                                        <p>No chats match your search</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                                            Try a different search term
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>No chats yet</p>
                                        <p style={{ fontSize: '12px', color: '#64748b' }}>
                                            {isAdmin() ? "Users who message you will appear here" : "Users you've referred will appear here"}
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                    onClick={() => handleSelectChat(chat)}
                                >
                                    <div className="chat-item-avatar">
                                        {chat.userName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="chat-item-info">
                                        <div className="chat-item-header">
                                            <span className="chat-item-name">{chat.userName}</span>
                                            {chat.unreadCount?.agent > 0 && (
                                                <span className="unread-badge">{chat.unreadCount.agent}</span>
                                            )}
                                        </div>
                                        <div className="chat-item-preview">
                                            {chat.lastMessage || "No messages yet"}
                                        </div>
                                        <div className="chat-item-time">
                                            {chat.lastMessageTime ?
                                                chat.lastMessageTime.toLocaleDateString() :
                                                ''}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className={`chat-messages-area glass-card${!mobileChatOpen && !selectedChat ? ' mobile-hidden' : mobileChatOpen ? '' : ''}`}>
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <button
                                    className="mobile-back-btn"
                                    onClick={() => setMobileChatOpen(false)}
                                    aria-label="Back to chat list"
                                >
                                    ← Back
                                </button>
                                <div className="chat-header-avatar">
                                    {selectedChat.userName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="chat-header-info">
                                    <h3>{selectedChat.userName}</h3>
                                    <span className="chat-header-email">{selectedChat.userEmail}</span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="empty-messages">
                                        <div className="empty-icon">💬</div>
                                        <p>No messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id} className={`message ${msg.senderRole}`}>
                                            <div className="message-bubble-wrapper">
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
                                                <button
                                                    className={`msg-delete-btn${deletingMessageId === msg.id ? ' deleting' : ''}`}
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    disabled={!!deletingMessageId}
                                                    title="Delete message"
                                                >
                                                    {deletingMessageId === msg.id ? '⏳' : '🗑️'}
                                                </button>
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
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="no-chat-icon">💬</div>
                            <h3>Select a chat to start messaging</h3>
                            <p>Choose a conversation from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Start New Chat</h2>
                            <button className="close-btn" onClick={() => setShowNewChatModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-search">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="modal-body">
                            {loadingUsers ? (
                                <div className="modal-loading">
                                    <div className="spinner"></div>
                                    <p>{isAdmin() ? 'Loading users...' : 'Loading your referred users...'}</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="empty-modal">
                                    <div className="empty-icon">👥</div>
                                    <p>
                                        {userSearch ? 'No users match your search' : (isAdmin() ? 'No users found' : 'No referred users yet')}
                                    </p>
                                </div>
                            ) : (
                                <div className="user-list">
                                    {filteredUsers.map((user) => {
                                        const displayName = user.name || user.email?.split("@")[0] || "User";
                                        const isStarting = startingChatId === user.id;

                                        return (
                                            <button
                                                key={user.id}
                                                type="button"
                                                className="user-item"
                                                disabled={!!startingChatId}
                                                onClick={() => handleStartChat(user.id)}
                                            >
                                                <div className="user-avatar">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name">{displayName}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                                <div className="chat-arrow">
                                                    {isStarting ? "..." : "→"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
