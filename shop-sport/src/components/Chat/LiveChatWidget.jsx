import React, { useState, useEffect, useRef } from 'react';
import chatApi from '../../api/chatApi';
import './LiveChatWidget.css';

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  
  const [chatUsers, setChatUsers] = useState([]);
  const [activeUserChat, setActiveUserChat] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadUsers, setUnreadUsers] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const isAdmin = role === 'ROLE_ADMIN';

  // Keep refs of activeUserChat and isOpen to avoid stale closures in WebSocket handler
  const activeUserChatRef = useRef(activeUserChat);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    activeUserChatRef.current = activeUserChat;
  }, [activeUserChat]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Periodically check credentials in localStorage to respond to login/logout
  useEffect(() => {
    const interval = setInterval(() => {
      const storedUser = localStorage.getItem('username') || '';
      const storedRole = localStorage.getItem('role') || '';
      if (storedUser !== username || storedRole !== role) {
        setUsername(storedUser);
        setRole(storedRole);
        // Reset state on credential change
        setMessages([]);
        setActiveUserChat('');
        setChatUsers([]);
        setUnreadCount(0);
        setUnreadUsers(new Set());
        if (socketRef.current) {
          socketRef.current.close();
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [username, role]);

  // Fetch initial data: Chat list for admin, message history for customers
  useEffect(() => {
    if (!username) return;

    if (isAdmin) {
      fetchChatUsers();
    } else {
      fetchChatHistory(username);
    }
  }, [username, role, isOpen]);

  // Listen to open-seller-chat custom events from Order History
  useEffect(() => {
    const handleOpenChat = (event) => {
      const { orderId } = event.detail || {};
      setIsOpen(true);
      if (isAdmin) {
        // If admin, we don't have direct support chat with seller, but we can search for the user who placed this order.
        // For standard user:
      } else {
        if (orderId) {
          setCurrentOrderId(orderId);
          setNewMessage(`Xin chào, tôi cần hỗ trợ về đơn hàng #${orderId}`);
        } else {
          setCurrentOrderId(null);
        }
      }
    };

    window.addEventListener('open-seller-chat', handleOpenChat);
    return () => window.removeEventListener('open-seller-chat', handleOpenChat);
  }, [isAdmin]);

  // Scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeUserChat]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      if (isAdmin && activeUserChat) {
        setUnreadUsers(prev => {
          const next = new Set(prev);
          next.delete(activeUserChat);
          return next;
        });
      } else if (!isAdmin) {
        setUnreadCount(0);
      }
    }
  }, [isOpen, activeUserChat, isAdmin]);

  // Manage WebSocket connection
  useEffect(() => {
    if (!username) {
      setSocketConnected(false);
      return;
    }

    let reconnectTimeout = null;

    const connect = () => {
      console.log(`Connecting chat WebSocket for username: ${username}`);
      const wsUrl = `ws://${window.location.hostname}:8086/ws-chat?username=${username}&role=${role}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Chat WebSocket connected successfully.");
        setSocketConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleIncomingMessage(msg);
        } catch (e) {
          console.error("Failed to parse incoming WebSocket message:", e);
        }
      };

      socket.onclose = () => {
        console.log("Chat WebSocket disconnected. Reconnecting in 5 seconds...");
        setSocketConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error("Chat WebSocket error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [username, role]);

  const handleIncomingMessage = (msg) => {
    const isMsgForAdmin = isAdmin;

    if (isMsgForAdmin) {
      // For Admin: check if the message belongs to the active customer conversation
      const isRelatedToActiveChat = 
        (msg.sender === activeUserChatRef.current && msg.receiver === 'admin') ||
        (msg.sender === 'admin' && msg.receiver === activeUserChatRef.current);

      if (isRelatedToActiveChat) {
        setMessages(prev => {
          if (prev.some(m => m.timestamp === msg.timestamp && m.sender === msg.sender && m.content === msg.content)) return prev;
          return [...prev, msg];
        });
      } else if (msg.sender !== 'admin') {
        // Message from another client: notify admin
        setUnreadUsers(prev => {
          const next = new Set(prev);
          next.add(msg.sender);
          return next;
        });
        setUnreadCount(prev => prev + 1);
        fetchChatUsers(); // Refresh active user list
      }
    } else {
      // For Customer: check if the message belongs to this customer
      const isRelatedToMe = 
        (msg.sender === username && msg.receiver === 'admin') ||
        (msg.sender === 'admin' && msg.receiver === username);

      if (isRelatedToMe) {
        setMessages(prev => {
          if (prev.some(m => m.timestamp === msg.timestamp && m.sender === msg.sender && m.content === msg.content)) return prev;
          return [...prev, msg];
        });

        // If chat is closed, increment customer's unread badge
        if (!isOpenRef.current) {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  };

  const fetchChatUsers = async () => {
    try {
      const response = await chatApi.getChatUsers();
      setChatUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching chat users:", error);
    }
  };

  const fetchChatHistory = async (targetUser) => {
    try {
      const response = await chatApi.getChatHistory(targetUser);
      setMessages(response.data || []);
    } catch (error) {
      console.error(`Error fetching chat history for ${targetUser}:`, error);
    }
  };

  const handleSelectUser = (user) => {
    setActiveUserChat(user);
    fetchChatHistory(user);
    setUnreadUsers(prev => {
      const next = new Set(prev);
      next.delete(user);
      return next;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      sender: username,
      receiver: isAdmin ? activeUserChat : 'admin',
      content: newMessage.trim(),
      orderId: currentOrderId,
      timestamp: Date.now()
    };

    socketRef.current.send(JSON.stringify(payload));
    setNewMessage('');
    setCurrentOrderId(null);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-widget-container">
      {/* Floating Action Button (FAB) */}
      <button 
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Trò chuyện với shop"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        )}
        {!isOpen && (isAdmin ? unreadUsers.size > 0 : unreadCount > 0) && (
          <span className="chat-badge">
            {isAdmin ? unreadUsers.size : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            {isAdmin && activeUserChat && (
              <button 
                className="chat-header-btn"
                onClick={() => setActiveUserChat('')}
                style={{ marginRight: '8px' }}
                title="Quay lại danh sách"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="chat-header-avatar">
              {isAdmin ? (activeUserChat ? activeUserChat.substring(0, 2) : 'AD') : 'SP'}
            </div>
            <div className="chat-header-details">
              <h4>
                {isAdmin 
                  ? (activeUserChat ? `Hỗ trợ: ${activeUserChat}` : 'Hộp thư Hỗ trợ')
                  : 'Hỗ trợ khách hàng'
                }
              </h4>
              <div className="chat-status-indicator">
                <span className="chat-status-dot"></span>
                <span>{socketConnected ? 'Đang trực tuyến' : 'Đang kết nối...'}</span>
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="chat-header-btn" onClick={() => setIsOpen(false)} title="Thu nhỏ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!username ? (
          <div className="chat-guest-notice">
            <div className="chat-empty-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <p className="text-gray-500 font-bold">Vui lòng đăng nhập để trò chuyện trực tiếp với cửa hàng.</p>
            <a href="/login" className="chat-login-btn">Đăng nhập ngay</a>
          </div>
        ) : isAdmin && !activeUserChat ? (
          /* Admin View - Conversation threads list */
          <div className="chat-admin-inbox">
            <h5 className="chat-admin-title">Cuộc hội thoại gần đây</h5>
            {chatUsers.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
                <p>Chưa có khách hàng nào nhắn tin.</p>
              </div>
            ) : (
              chatUsers.map((user) => (
                <div 
                  key={user} 
                  className="chat-user-item"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="chat-user-item-info">
                    <div className="chat-user-avatar">{user.substring(0, 2)}</div>
                    <div>
                      <h4 className="chat-user-name">{user}</h4>
                      <p className="chat-user-subtext">Khách hàng cần bạn hỗ trợ tư vấn...</p>
                    </div>
                  </div>
                  {unreadUsers.has(user) && <div className="chat-unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Active Chat Thread View (For Customer or selected Admin Chat) */
          <>
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="chat-empty-state">
                  <div className="chat-empty-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <p>
                    {isAdmin 
                      ? `Bắt đầu cuộc trò chuyện với ${activeUserChat}`
                      : 'Chào bạn! Hãy gửi tin nhắn cho chúng tôi để được tư vấn hỗ trợ nhé.'
                    }
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isSentByMe = msg.sender === username || (isAdmin && msg.sender === 'admin');
                  return (
                    <div 
                      key={index} 
                      className={`chat-msg-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                    >
                      {!isSentByMe && (
                        <span className="chat-msg-sender-label">
                          {msg.sender === 'admin' ? 'Cửa hàng' : msg.sender}
                        </span>
                      )}
                      <div className="chat-msg-bubble">
                        {msg.content}
                      </div>
                      <span className="chat-msg-info">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form className="chat-footer" onSubmit={handleSendMessage}>
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={!newMessage.trim() || !socketConnected}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveChatWidget;
