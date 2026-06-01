import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Tôi là SportyAI. Tôi có thể giúp gì cho bạn hôm nay?", isBot: true }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const productMatch = window.location.pathname.match(/\/product\/(\d+)/);
        const productId = productMatch ? productMatch[1] : null;
        const userMessage = { text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await axiosClient.post('/ai/chat', { message: input, productId });
            const botMessage = { text: response.data.response, isBot: true };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, tôi gặp chút trục trặc trong quá trình xử lý. Bạn thử lại sau nhé!", isBot: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-widget">
            {/* Nút FAB */}
            <button 
                className={`ai-chat-toggle-btn ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <div className="flex items-center justify-center">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    </div>
                )}
            </button>

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-black italic uppercase tracking-tighter text-white">SportyAI Agent</h4>
                                <p className="text-[10px] text-blue-100 uppercase font-bold">Online & Ready to help</p>
                            </div>
                        </div>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="ai-message-content">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="ai-message bot">
                                <div className="ai-message-content ai-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-chat-input-area">
                        <input 
                            type="text" 
                            placeholder="Hỏi tôi bất cứ điều gì..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={loading}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
