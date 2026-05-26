package iuh.fit.chat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import iuh.fit.chat.dto.ChatMessage;
import iuh.fit.chat.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    // Thread-safe map to store username -> WebSocketSession
    private static final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    // Thread-safe map to store WebSocketSession -> username for cleanup
    private static final Map<WebSocketSession, String> sessionUsernames = new ConcurrentHashMap<>();
    // Thread-safe map to store WebSocketSession -> role
    private static final Map<WebSocketSession, String> sessionRoles = new ConcurrentHashMap<>();

    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ChatWebSocketHandler(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String username = null;
        String role = null;
        if (query != null) {
            String[] params = query.split("&");
            for (String param : params) {
                String[] pair = param.split("=");
                if (pair.length > 1) {
                    if ("username".equals(pair[0])) {
                        username = pair[1];
                    } else if ("role".equals(pair[0])) {
                        role = pair[1];
                    }
                }
            }
        }

        if (username != null && !username.trim().isEmpty()) {
            userSessions.put(username, session);
            sessionUsernames.put(session, username);
            if (role != null) {
                sessionRoles.put(session, role);
            }
            System.out.println("WebSocket connection established for user: " + username + " with role: " + role);
        } else {
            System.out.println("WebSocket connection established without username, closing session");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
            
            // Set timestamp if not set
            if (chatMessage.getTimestamp() == null) {
                chatMessage.setTimestamp(new java.util.Date());
            }

            // Get sender info from session
            String sessionUsername = sessionUsernames.get(session);
            String sessionRole = sessionRoles.get(session);
            boolean isSenderAdmin = "ROLE_ADMIN".equals(sessionRole);

            // Normalize sender: if sender has ROLE_ADMIN, set sender username to "admin"
            if (isSenderAdmin) {
                chatMessage.setSender("admin");
            } else {
                chatMessage.setSender(sessionUsername);
            }

            // If receiver is empty/null, set it
            if (chatMessage.getReceiver() == null || chatMessage.getReceiver().isEmpty()) {
                if (isSenderAdmin) {
                    System.err.println("Admin sent a message without receiver!");
                    return;
                } else {
                    chatMessage.setReceiver("admin");
                }
            }

            // Save message to database
            chatMessage = chatMessageRepository.save(chatMessage);
            System.out.println("New message: " + chatMessage.getSender() + " -> " + chatMessage.getReceiver() + ": " + chatMessage.getContent());

            // Convert normalized chatMessage back to JSON string to send
            String jsonMessage = objectMapper.writeValueAsString(chatMessage);
            TextMessage textMsg = new TextMessage(jsonMessage);

            // Deliver the message
            if ("admin".equals(chatMessage.getReceiver())) {
                // Send to all connected admins
                for (Map.Entry<WebSocketSession, String> entry : sessionRoles.entrySet()) {
                    if ("ROLE_ADMIN".equals(entry.getValue())) {
                        WebSocketSession adminSession = entry.getKey();
                        if (adminSession.isOpen()) {
                            adminSession.sendMessage(textMsg);
                        }
                    }
                }
            } else {
                // Send to specific customer receiver
                WebSocketSession receiverSession = userSessions.get(chatMessage.getReceiver());
                if (receiverSession != null && receiverSession.isOpen()) {
                    receiverSession.sendMessage(textMsg);
                }
            }

            // Echo back to sender session to confirm reception and return the timestamp/normalized structure
            if (session.isOpen()) {
                session.sendMessage(textMsg);
            }

        } catch (IOException e) {
            System.err.println("Failed to parse chat message JSON: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = sessionUsernames.remove(session);
        sessionRoles.remove(session);
        if (username != null) {
            userSessions.remove(username);
            System.out.println("WebSocket connection closed for user: " + username);
        }
    }

    // Get chat history for a specific customer (exchanges between user and admin)
    public List<ChatMessage> getHistoryForUser(String username) {
        if ("admin".equals(username)) {
            return chatMessageRepository.findAllByOrderByTimestampAsc();
        }
        return chatMessageRepository.findHistoryForUser(username);
    }

    // Get list of distinct customers who have sent or received messages
    public List<String> getChatUsers() {
        Set<String> users = new HashSet<>();
        users.addAll(chatMessageRepository.findSenders());
        users.addAll(chatMessageRepository.findReceivers());
        users.remove(null);
        users.remove("");
        return new ArrayList<>(users);
    }
}
